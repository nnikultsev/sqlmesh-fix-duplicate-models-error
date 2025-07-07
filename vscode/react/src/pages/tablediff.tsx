import '../App.css'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query'
import { useApiModels } from '@/api'
import { useEventBus } from '@/hooks/eventBus'
import React, { useState } from 'react'
import type { VSCodeEvent } from '@bus/callbacks'
import { URI } from 'vscode-uri'
import type { Model } from '@/api/client'
import { useRpc } from '@/utils/rpc'
import { TableDiff } from '../components/tablediff/TableDiff'

export function TableDiffPage() {
  const { emit } = useEventBus()

  // Handle messages from VSCode extension
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from VSCode
      if (event.data && event.data.key === 'vscode_send') {
        const payload: VSCodeEvent = event.data.payload
        switch (payload.key) {
          case 'changeFocusOnFile':
            emit('changeFocusedFile', { fileUri: payload.payload.path })
            break
          case 'savedFile':
            emit('savedFile', { fileUri: payload.payload.fileUri })
            break
          default:
            console.error(
              'Unhandled message type in table diff page:',
              payload.key,
            )
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const client = new QueryClient({
    queryCache: new QueryCache({}),
    defaultOptions: {
      queries: {
        networkMode: 'always',
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: Infinity,
      },
    },
  })

  return (
    <QueryClientProvider client={client}>
      <TableDiffContent />
    </QueryClientProvider>
  )
}

function TableDiffContent() {
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined,
  )
  const { on } = useEventBus()
  const queryClient = useQueryClient()

  const {
    data: models,
    isLoading: isLoadingModels,
    error: modelsError,
  } = useApiModels()
  const rpc = useRpc()

  React.useEffect(() => {
    const fetchFirstTimeModelIfNotSet = async (
      models: Model[],
    ): Promise<string | undefined> => {
      if (!Array.isArray(models)) {
        return undefined
      }
      const activeFile = await rpc('get_active_file', {})
      // @ts-ignore
      if (!activeFile.fileUri) {
        return models[0].name
      }
      // @ts-ignore
      const fileUri: string = activeFile.fileUri
      const filePath = URI.file(fileUri).path
      const model = models.find(
        (m: Model) => URI.file(m.full_path).path === filePath,
      )
      if (model) {
        return model.name
      }
      return undefined
    }
    if (selectedModel === undefined && Array.isArray(models)) {
      fetchFirstTimeModelIfNotSet(models).then(modelName => {
        if (modelName && selectedModel === undefined) {
          setSelectedModel(modelName)
        } else {
          setSelectedModel(models[0].name)
        }
      })
    }
  }, [models, selectedModel])

  const modelsRecord =
    Array.isArray(models) &&
    models.reduce(
      (acc, model) => {
        acc[model.name] = model
        return acc
      },
      {} as Record<string, Model>,
    )

  React.useEffect(() => {
    const handleChangeFocusedFile = (fileUri: { fileUri: string }) => {
      const full_path = URI.parse(fileUri.fileUri).path
      const model = Object.values(modelsRecord).find(
        m => URI.file(m.full_path).path === full_path,
      )
      if (model) {
        setSelectedModel(model.name)
      }
    }

    const handleSavedFile = () => {
      queryClient.invalidateQueries()
    }

    const offChangeFocusedFile = on(
      'changeFocusedFile',
      handleChangeFocusedFile,
    )
    const offSavedFile = on('savedFile', handleSavedFile)

    // If your event bus returns an "off" function, call it on cleanup
    return () => {
      if (offChangeFocusedFile) offChangeFocusedFile()
      if (offSavedFile) offSavedFile()
    }
  }, [on, queryClient, modelsRecord])

  if (modelsError) {
    return <div>Error: {modelsError.message}</div>
  }

  if (
    isLoadingModels ||
    models === undefined ||
    modelsRecord === false ||
    selectedModel === undefined
  ) {
    return <div>Loading models...</div>
  }
  if (!Array.isArray(models)) {
    return <div>Error: Models data is not in the expected format</div>
  }

  return (
    <div className="h-[100vh] w-[100vw]">
      <TableDiff />
    </div>
  )
}
