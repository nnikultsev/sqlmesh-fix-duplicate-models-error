import { useMemo } from 'react'
import { SectionToggle } from './SectionToggle'
import { type TableDiffData, themeColors } from './types'

interface SchemaDiffSectionProps {
  schemaDiff: TableDiffData['schema_diff']
  expanded: boolean
  onToggle: () => void
}

interface SchemaChangeItemProps {
  column: string
  type: string
  changeType: 'added' | 'removed' | 'modified'
}

const SchemaChangeItem = ({ column, type, changeType }: SchemaChangeItemProps) => {
  const styles = {
    added: {
      backgroundColor: 'var(--vscode-diffEditor-insertedTextBackground, rgba(34, 197, 94, 0.2))',
      borderColor: themeColors.addedText,
      color: themeColors.addedText,
      symbol: '+',
    },
    removed: {
      backgroundColor: 'var(--vscode-diffEditor-removedTextBackground, rgba(239, 68, 68, 0.2))',
      borderColor: themeColors.removedText,
      color: themeColors.removedText,
      symbol: '-',
    },
    modified: {
      backgroundColor: 'var(--vscode-diffEditor-modifiedTextBackground, rgba(245, 158, 11, 0.2))',
      borderColor: themeColors.modifiedText,
      color: themeColors.modifiedText,
      symbol: '~',
    },
  }

  const style = styles[changeType]

  return (
    <div
      className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
      style={{
        backgroundColor: style.backgroundColor,
        borderLeft: `2px solid ${style.borderColor}`,
      }}
    >
      <span
        className="font-mono font-bold"
        style={{ color: style.color }}
      >
        {style.symbol}
      </span>
      <span
        className="font-mono truncate"
        title={column}
        style={{ color: style.color }}
      >
        {column}
      </span>
      <span style={{ color: themeColors.muted }}>:</span>
      <span
        className="truncate"
        title={type}
        style={{ color: style.color }}
      >
        {type}
      </span>
    </div>
  )
}

export function SchemaDiffSection({
  schemaDiff,
  expanded,
  onToggle,
}: SchemaDiffSectionProps) {
  const schemaHasChanges = useMemo(() => {
    return (
      Object.keys(schemaDiff.added || {}).length > 0 ||
      Object.keys(schemaDiff.removed || {}).length > 0 ||
      Object.keys(schemaDiff.modified || {}).length > 0
    )
  }, [schemaDiff])

  const totalChanges = 
    Object.keys(schemaDiff.added).length + 
    Object.keys(schemaDiff.removed).length + 
    Object.keys(schemaDiff.modified).length

  return (
    <SectionToggle
      id="schema"
      title="Schema Changes"
      badge={
        schemaHasChanges
          ? `${totalChanges} changes`
          : 'No changes'
      }
      badgeStyle={{
        backgroundColor: schemaHasChanges
          ? 'var(--vscode-diffEditor-modifiedTextBackground, rgba(245, 158, 11, 0.2))'
          : 'var(--vscode-diffEditor-insertedTextBackground, rgba(34, 197, 94, 0.2))',
        color: schemaHasChanges
          ? themeColors.modifiedText
          : themeColors.addedText,
        borderColor: schemaHasChanges
          ? themeColors.modifiedText
          : themeColors.addedText,
      }}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="px-8 py-3 space-y-2">
        {!schemaHasChanges ? (
          <div
            className="text-xs"
            style={{ color: themeColors.success }}
          >
            ✓ Schemas are identical
          </div>
        ) : (
          <>
            {Object.entries(schemaDiff.added).map(([col, type]) => (
              <SchemaChangeItem key={col} column={col} type={type} changeType="added" />
            ))}
            {Object.entries(schemaDiff.removed).map(([col, type]) => (
              <SchemaChangeItem key={col} column={col} type={type} changeType="removed" />
            ))}
            {Object.entries(schemaDiff.modified).map(([col, type]) => (
              <SchemaChangeItem key={col} column={col} type={type} changeType="modified" />
            ))}
          </>
        )}
      </div>
    </SectionToggle>
  )
}