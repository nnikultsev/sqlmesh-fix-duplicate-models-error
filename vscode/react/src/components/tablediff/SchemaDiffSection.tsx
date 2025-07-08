import { useMemo } from 'react'
import { SectionToggle } from './SectionToggle'
import { type TableDiffData, themeColors } from './types'

interface SchemaDiffSectionProps {
  schemaDiff: TableDiffData['schema_diff']
  expanded: boolean
  onToggle: () => void
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
      badge={schemaHasChanges ? `${totalChanges} changes` : 'No changes'}
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
              <div
                key={col}
                className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
                style={{
                  backgroundColor:
                    'var(--vscode-diffEditor-insertedTextBackground, rgba(34, 197, 94, 0.2))',
                  borderLeft: `2px solid ${themeColors.addedText}`,
                }}
              >
                <span
                  className="font-mono font-bold"
                  style={{ color: themeColors.addedText }}
                >
                  +
                </span>
                <span
                  className="font-mono truncate"
                  title={col}
                  style={{ color: themeColors.addedText }}
                >
                  {col}
                </span>
                <span style={{ color: themeColors.muted }}>:</span>
                <span
                  className="truncate"
                  title={type}
                  style={{ color: themeColors.addedText }}
                >
                  {type}
                </span>
              </div>
            ))}
            {Object.entries(schemaDiff.removed).map(([col, type]) => (
              <div
                key={col}
                className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
                style={{
                  backgroundColor:
                    'var(--vscode-diffEditor-removedTextBackground, rgba(239, 68, 68, 0.2))',
                  borderLeft: `2px solid ${themeColors.removedText}`,
                }}
              >
                <span
                  className="font-mono font-bold"
                  style={{ color: themeColors.removedText }}
                >
                  -
                </span>
                <span
                  className="font-mono truncate"
                  title={col}
                  style={{ color: themeColors.removedText }}
                >
                  {col}
                </span>
                <span style={{ color: themeColors.muted }}>:</span>
                <span
                  className="truncate"
                  title={type}
                  style={{ color: themeColors.removedText }}
                >
                  {type}
                </span>
              </div>
            ))}
            {Object.entries(schemaDiff.modified).map(([col, type]) => (
              <div
                key={col}
                className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
                style={{
                  backgroundColor:
                    'var(--vscode-diffEditor-modifiedTextBackground, rgba(245, 158, 11, 0.2))',
                  borderLeft: `2px solid ${themeColors.modifiedText}`,
                }}
              >
                <span
                  className="font-mono font-bold"
                  style={{ color: themeColors.modifiedText }}
                >
                  ~
                </span>
                <span
                  className="font-mono truncate"
                  title={col}
                  style={{ color: themeColors.modifiedText }}
                >
                  {col}
                </span>
                <span style={{ color: themeColors.muted }}>:</span>
                <span
                  className="truncate"
                  title={type}
                  style={{ color: themeColors.modifiedText }}
                >
                  {type}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </SectionToggle>
  )
}
