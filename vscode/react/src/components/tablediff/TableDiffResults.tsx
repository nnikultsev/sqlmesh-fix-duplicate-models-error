import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// Type for data values in samples - can be strings, numbers, booleans, or null
type SampleValue = string | number | boolean | null

// Type for row data in samples
type SampleRow = Record<string, SampleValue>

// Type for column statistics
type ColumnStats = Record<string, number | string | null>

/**
 * Utility — cheap clsx replacement for conditional class composition.
 */
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Persist state in localStorage so the user's expand / collapse choices
 * survive reloads and navigation in VS Code's WebView.
 */
function usePersistedState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* noop */
    }
  }, [key, state])

  return [state, setState]
}

/**
 * Generic section wrapper with built‑in chevron toggle, animated collapse and badge.
 */
interface SectionToggleProps {
  id: keyof ExpandedSections
  title: string
  badge?: string
  badgeStyle?: React.CSSProperties
  expanded: boolean
  onToggle(): void
  children: ReactNode
}

function SectionToggle({
  title,
  badge,
  badgeStyle,
  expanded,
  onToggle,
  children,
}: SectionToggleProps) {
  return (
    <div style={{ borderBottom: '1px solid var(--vscode-panel-border)' }}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center text-left select-none transition-colors"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--vscode-editor-foreground)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor =
            'var(--vscode-list-hoverBackground)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {expanded ? (
          <ChevronDownIcon className="w-4 h-4 mr-2 shrink-0 transition-transform" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 mr-2 shrink-0 transition-transform" />
        )}
        <span className="font-medium flex-1">{title}</span>
        {badge && (
          <span
            className="text-xs px-2 py-0.5 rounded ml-2 border"
            style={badgeStyle}
          >
            {badge}
          </span>
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-300 ease-in-out',
          expanded ? 'max-h-[2000px]' : 'max-h-0',
        )}
      >
        {expanded && children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
interface TableDiffData {
  schema_diff: {
    source: string
    target: string
    source_schema: Record<string, string>
    target_schema: Record<string, string>
    added: Record<string, string>
    removed: Record<string, string>
    modified: Record<string, string>
  }
  row_diff: {
    source: string
    target: string
    stats: Record<string, number>
    sample: Record<string, SampleValue[]>
    joined_sample: Record<string, SampleValue[]>
    s_sample: Record<string, SampleValue[]>
    t_sample: Record<string, SampleValue[]>
    column_stats: ColumnStats
    source_count: number
    target_count: number
    count_pct_change: number
    decimals: number
    processed_sample_data?: {
      column_differences: SampleRow[]
      source_only: SampleRow[]
      target_only: SampleRow[]
    }
  }
  on: string[][]
}

interface Props {
  data: TableDiffData
}

interface ExpandedSections {
  schema: boolean
  rows: boolean
  columnStats: boolean
  sampleData: boolean
}

// ---------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------

const formatCellValue = (cell: SampleValue, decimals = 3): string => {
  if (cell == null) return 'null'
  if (typeof cell === 'number')
    return cell % 1 === 0 ? cell.toString() : cell.toFixed(decimals)
  return String(cell)
}

// ---------------------------------------------------------------
// Theme-aware Colors
// ---------------------------------------------------------------
const themeColors = {
  success: 'var(--vscode-testing-iconPassed, #22c55e)',
  warning: 'var(--vscode-testing-iconQueued, #f59e0b)',
  error: 'var(--vscode-testing-iconFailed, #ef4444)',
  info: 'var(--vscode-symbolIcon-variableForeground, #3b82f6)',

  // Diff colors
  added:
    'var(--vscode-diffEditor-insertedTextBackground, rgba(34, 197, 94, 0.2))',
  removed:
    'var(--vscode-diffEditor-removedTextBackground, rgba(239, 68, 68, 0.2))',
  modified:
    'var(--vscode-diffEditor-insertedLineBackground, rgba(245, 158, 11, 0.2))',

  // Text colors
  addedText: 'var(--vscode-gitDecoration-addedResourceForeground, #22c55e)',
  removedText: 'var(--vscode-gitDecoration-deletedResourceForeground, #ef4444)',
  modifiedText:
    'var(--vscode-gitDecoration-modifiedResourceForeground, #f59e0b)',

  muted: 'var(--vscode-descriptionForeground)',
  accent: 'var(--vscode-textLink-foreground)',
  border: 'var(--vscode-panel-border)',
}

// ---------------------------------------------------------------
// SampleDataSection
// ---------------------------------------------------------------
function SampleDataSection({
  rowDiff,
}: {
  rowDiff: TableDiffData['row_diff']
}) {
  const { processed_sample_data, decimals = 3 } = rowDiff

  // // Debug logging
  // console.log('rowDiff:', rowDiff)
  // console.log('processed_sample_data:', processed_sample_data)

  if (!processed_sample_data) {
    return (
      <div className="px-8 py-3">
        <p
          className="text-sm"
          style={{ color: themeColors.muted }}
        >
          No processed sample data available
        </p>
      </div>
    )
  }

  const { column_differences, source_only, target_only } = processed_sample_data

  // // debug the structure
  // console.log('column_differences:', column_differences)
  // console.log('column_differences length:', column_differences?.length)
  // if (column_differences?.length > 0) {
  //   console.log('First item in column_differences:', column_differences[0])
  // }

  // Group column differences by column name
  const groupedDifferences = useMemo(() => {
    const groups: Record<string, SampleRow[]> = {}

    column_differences.forEach((row: SampleRow) => {
      const columnName = String(row.__column_name__ || 'unknown')
      if (!groups[columnName]) {
        groups[columnName] = []
      }
      groups[columnName].push(row)
    })

    return groups
  }, [column_differences])

  return (
    <div className="px-8 py-3 space-y-6">
      {/* COMMON ROWS diff */}
      <div>
        <h4
          className="text-sm font-medium mb-3"
          style={{ color: themeColors.info }}
        >
          COMMON ROWS Data Differences:
        </h4>
        {Object.keys(groupedDifferences).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedDifferences).map(([columnName, rows]) => {
              if (!rows || rows.length === 0) return null

              const sourceName = rows[0].__source_name__
              const targetName = rows[0].__target_name__

              return (
                <div
                  key={columnName}
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor:
                      'var(--vscode-editor-inactiveSelectionBackground)',
                    borderColor: themeColors.border,
                  }}
                >
                  <h5
                    className="font-medium mb-2 underline"
                    style={{ color: themeColors.accent }}
                  >
                    Column: {columnName}
                  </h5>
                  <div className="overflow-auto max-h-80">
                    <table className="w-full text-xs">
                      <thead
                        className="sticky top-0 z-10"
                        style={{
                          backgroundColor: 'var(--vscode-editor-background)',
                        }}
                      >
                        <tr
                          style={{
                            borderBottom: `1px solid ${themeColors.border}`,
                          }}
                        >
                          {Object.keys(rows[0] || {})
                            .filter(key => !key.startsWith('__'))
                            .map(key => (
                              <th
                                key={key}
                                className="text-left py-2 px-2 font-medium whitespace-nowrap"
                                style={{
                                  color:
                                    key === sourceName
                                      ? themeColors.info
                                      : key === targetName
                                        ? themeColors.success
                                        : themeColors.muted,
                                }}
                              >
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows
                          .slice(0, 10)
                          .map((row: SampleRow, rowIdx: number) => (
                            <tr
                              key={rowIdx}
                              className="transition-colors"
                              style={{
                                borderBottom: `1px solid ${themeColors.border}`,
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor =
                                  'var(--vscode-list-hoverBackground)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor =
                                  'transparent'
                              }}
                            >
                              {Object.entries(row)
                                .filter(([key]) => !key.startsWith('__'))
                                .map(([key, cell]) => (
                                  <td
                                    key={key}
                                    className="py-2 px-2 font-mono whitespace-nowrap"
                                    style={{
                                      color:
                                        key === sourceName
                                          ? themeColors.info
                                          : key === targetName
                                            ? themeColors.success
                                            : 'var(--vscode-editor-foreground)',
                                      backgroundColor:
                                        key === sourceName
                                          ? 'var(--vscode-diffEditor-insertedTextBackground, rgba(59, 130, 246, 0.1))'
                                          : key === targetName
                                            ? 'var(--vscode-diffEditor-removedTextBackground, rgba(34, 197, 94, 0.1))'
                                            : 'transparent',
                                    }}
                                  >
                                    {formatCellValue(cell, decimals)}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 10 && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: themeColors.muted }}
                    >
                      Showing first 10 of {rows.length} differing rows
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p
            className="text-sm"
            style={{ color: themeColors.success }}
          >
            ✓ All joined rows match
          </p>
        )}
      </div>

      {/* SOURCE ONLY & TARGET ONLY tables */}
      {source_only && source_only.length > 0 && (
        <div>
          <h4
            className="text-sm font-medium mb-3"
            style={{ color: themeColors.warning }}
          >
            SOURCE ONLY Rows:
          </h4>
          <div
            className="border rounded-lg p-4"
            style={{
              backgroundColor: themeColors.modified,
              borderColor: themeColors.modifiedText,
            }}
          >
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead
                  className="sticky top-0 z-10"
                  style={{ backgroundColor: themeColors.modified }}
                >
                  <tr
                    style={{
                      borderBottom: `1px solid ${themeColors.modifiedText}`,
                    }}
                  >
                    {Object.keys(source_only[0] || {}).map(col => (
                      <th
                        key={col}
                        className="text-left py-2 px-2 font-medium whitespace-nowrap"
                        style={{ color: themeColors.modifiedText }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {source_only
                    .slice(0, 10)
                    .map((row: SampleRow, rowIdx: number) => (
                      <tr
                        key={rowIdx}
                        className="transition-colors"
                        style={{
                          borderBottom: `1px solid ${themeColors.modifiedText}`,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor =
                            'var(--vscode-list-hoverBackground)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        {Object.values(row).map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="py-2 px-2 font-mono whitespace-nowrap"
                            style={{ color: themeColors.modifiedText }}
                          >
                            {formatCellValue(cell, decimals)}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {source_only.length > 10 && (
              <p
                className="text-xs mt-2"
                style={{ color: themeColors.modifiedText }}
              >
                Showing first 10 of {source_only.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {target_only && target_only.length > 0 && (
        <div>
          <h4
            className="text-sm font-medium mb-3"
            style={{ color: themeColors.success }}
          >
            TARGET ONLY Rows:
          </h4>
          <div
            className="border rounded-lg p-4"
            style={{
              backgroundColor: themeColors.added,
              borderColor: themeColors.addedText,
            }}
          >
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead
                  className="sticky top-0 z-10"
                  style={{ backgroundColor: themeColors.added }}
                >
                  <tr
                    style={{
                      borderBottom: `1px solid ${themeColors.addedText}`,
                    }}
                  >
                    {Object.keys(target_only[0] || {}).map(col => (
                      <th
                        key={col}
                        className="text-left py-2 px-2 font-medium whitespace-nowrap"
                        style={{ color: themeColors.addedText }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {target_only
                    .slice(0, 10)
                    .map((row: SampleRow, rowIdx: number) => (
                      <tr
                        key={rowIdx}
                        className="transition-colors"
                        style={{
                          borderBottom: `1px solid ${themeColors.addedText}`,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor =
                            'var(--vscode-list-hoverBackground)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        {Object.values(row).map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="py-2 px-2 font-mono whitespace-nowrap"
                            style={{ color: themeColors.addedText }}
                          >
                            {formatCellValue(cell, decimals)}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {target_only.length > 10 && (
              <p
                className="text-xs mt-2"
                style={{ color: themeColors.addedText }}
              >
                Showing first 10 of {target_only.length} rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------
// Main Tablediff Component
// ---------------------------------------------------------------
export function TableDiffResults({ data }: Props) {
  const [expanded, setExpanded] = usePersistedState<ExpandedSections>(
    'tableDiffExpanded',
    {
      schema: true,
      rows: true,
      columnStats: false,
      sampleData: false,
    },
  )

  if (!data)
    return (
      <div
        className="p-4"
        style={{ color: themeColors.muted }}
      >
        No data available
      </div>
    )

  const { schema_diff, row_diff } = data
  if (!schema_diff || !row_diff)
    return (
      <div
        className="p-4"
        style={{ color: themeColors.muted }}
      >
        Invalid data structure
      </div>
    )

  const toggle = (key: keyof ExpandedSections) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  const expandAll = () =>
    setExpanded({
      schema: true,
      rows: true,
      columnStats: true,
      sampleData: true,
    })
  const collapseAll = () =>
    setExpanded({
      schema: false,
      rows: false,
      columnStats: false,
      sampleData: false,
    })

  // Derived helpers ---------------------------------------------------------
  const schemaHasChanges = useMemo(() => {
    return (
      Object.keys(schema_diff.added || {}).length > 0 ||
      Object.keys(schema_diff.removed || {}).length > 0 ||
      Object.keys(schema_diff.modified || {}).length > 0
    )
  }, [schema_diff])

  const formatPercentage = (v: number) => `${(v * 100).toFixed(1)}%`
  const formatCount = (v: number) => v.toLocaleString()

  const fullMatchCount = Math.round(row_diff.stats.full_match_count || 0)
  const joinCount = Math.round(row_diff.stats.join_count || 0)
  const partialMatchCount = joinCount - fullMatchCount
  const sOnlyCount = Math.round(row_diff.stats.s_only_count || 0)
  const tOnlyCount = Math.round(row_diff.stats.t_only_count || 0)
  const totalRows = row_diff.source_count + row_diff.target_count
  const fullMatchPct = totalRows > 0 ? (2 * fullMatchCount) / totalRows : 0

  // ------------------------------------------------------------------------

  return (
    <div
      className="h-full w-full text-[13px] font-sans"
      style={{
        backgroundColor: 'var(--vscode-editor-background)',
        color: 'var(--vscode-editor-foreground)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 space-y-2 sticky top-0 z-20"
        style={{
          borderBottom: `1px solid ${themeColors.border}`,
          backgroundColor: 'var(--vscode-editor-background)',
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-sm font-medium"
            style={{ color: themeColors.info }}
          >
            Source:
          </span>
          <code
            className="px-2 py-1 rounded text-sm whitespace-nowrap"
            style={{
              color: themeColors.info,
              backgroundColor: 'var(--vscode-input-background)',
              border: `1px solid ${themeColors.border}`,
            }}
          >
            {schema_diff.source}
          </code>
          <span
            className="text-sm font-medium ml-4"
            style={{ color: themeColors.success }}
          >
            Target:
          </span>
          <code
            className="px-2 py-1 rounded text-sm whitespace-nowrap"
            style={{
              color: themeColors.success,
              backgroundColor: 'var(--vscode-input-background)',
              border: `1px solid ${themeColors.border}`,
            }}
          >
            {schema_diff.target}
          </code>
        </div>
        <div className="flex items-center gap-6 text-xs flex-wrap">
          <span style={{ color: themeColors.info }}>
            Source rows:{' '}
            <span className="font-medium">
              {formatCount(row_diff.source_count)}
            </span>
          </span>
          <span style={{ color: themeColors.success }}>
            Target rows:{' '}
            <span className="font-medium">
              {formatCount(row_diff.target_count)}
            </span>
          </span>
          <span
            style={{
              color:
                row_diff.count_pct_change > 0
                  ? themeColors.success
                  : row_diff.count_pct_change < 0
                    ? themeColors.error
                    : themeColors.muted,
            }}
          >
            Change:{' '}
            <span className="font-medium">
              {row_diff.count_pct_change > 0 ? '+' : ''}
              {row_diff.count_pct_change}
              {'%'}
            </span>
          </span>
        </div>
        {/* Global controls */}
        <div className="flex gap-3 text-xs pt-1">
          <button
            onClick={expandAll}
            className="underline transition-colors"
            style={{ color: themeColors.accent }}
            onMouseEnter={e =>
              (e.currentTarget.style.color =
                'var(--vscode-textLink-activeForeground)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.color = themeColors.accent)
            }
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="underline transition-colors"
            style={{ color: themeColors.accent }}
            onMouseEnter={e =>
              (e.currentTarget.style.color =
                'var(--vscode-textLink-activeForeground)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.color = themeColors.accent)
            }
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-120px)]">
        {/* Schema Changes */}
        <SectionToggle
          id="schema"
          title="Schema Changes"
          badge={
            schemaHasChanges
              ? `${Object.keys(schema_diff.added).length + Object.keys(schema_diff.removed).length + Object.keys(schema_diff.modified).length} changes`
              : 'No changes'
          }
          badgeStyle={{
            backgroundColor: schemaHasChanges
              ? themeColors.modified
              : themeColors.added,
            color: schemaHasChanges
              ? themeColors.modifiedText
              : themeColors.addedText,
            borderColor: schemaHasChanges
              ? themeColors.modifiedText
              : themeColors.addedText,
          }}
          expanded={expanded.schema}
          onToggle={() => toggle('schema')}
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
                {Object.entries(schema_diff.added).map(([col, type]) => (
                  <div
                    key={col}
                    className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
                    style={{
                      backgroundColor: themeColors.added,
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
                {Object.entries(schema_diff.removed).map(([col, type]) => (
                  <div
                    key={col}
                    className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
                    style={{
                      backgroundColor: themeColors.removed,
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
                {Object.entries(schema_diff.modified).map(([col, type]) => (
                  <div
                    key={col}
                    className="flex items-center gap-2 text-xs pl-3 py-1 rounded-r"
                    style={{
                      backgroundColor: themeColors.modified,
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

        {/* Row Statistics */}
        <SectionToggle
          id="rows"
          title="Row Statistics"
          badge={`${formatPercentage(fullMatchPct)} match rate`}
          badgeStyle={{
            backgroundColor: 'var(--vscode-input-background)',
            color: themeColors.info,
            borderColor: themeColors.info,
          }}
          expanded={expanded.rows}
          onToggle={() => toggle('rows')}
        >
          <div className="px-8 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span style={{ color: themeColors.success }}>
                    ✓ Full Matches
                  </span>
                  <span className="font-medium">
                    {formatCount(fullMatchCount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.info }}>
                    ~ Partial Matches
                  </span>
                  <span className="font-medium">
                    {formatCount(partialMatchCount)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span style={{ color: themeColors.warning }}>
                    + Source Only
                  </span>
                  <span className="font-medium">{formatCount(sOnlyCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.error }}>
                    - Target Only
                  </span>
                  <span className="font-medium">{formatCount(tOnlyCount)}</span>
                </div>
              </div>
            </div>
            {/* Match rate progress bar */}
            <div className="mt-3 space-y-1">
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: themeColors.muted }}
              >
                <span>Match Rate</span>
                <span className="font-medium">
                  {formatPercentage(fullMatchPct)}
                </span>
              </div>
              <div
                className="relative h-2 rounded overflow-hidden"
                style={{
                  backgroundColor: 'var(--vscode-progressBar-background, #333)',
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-500"
                  style={{
                    width: `${fullMatchPct * 100}%`,
                    background: `linear-gradient(to right, ${themeColors.success}, ${themeColors.success})`,
                  }}
                />
              </div>
            </div>
          </div>
        </SectionToggle>

        {/* Column Statistics */}
        {Object.keys(row_diff.column_stats || {}).length > 0 && (
          <SectionToggle
            id="columnStats"
            title="Column Statistics"
            badge={`${Object.keys(row_diff.column_stats).length} columns`}
            badgeStyle={{
              backgroundColor: 'var(--vscode-input-background)',
              color: 'var(--vscode-symbolIcon-classForeground, #9b59b6)',
              borderColor: 'var(--vscode-symbolIcon-classForeground, #9b59b6)',
            }}
            expanded={expanded.columnStats}
            onToggle={() => toggle('columnStats')}
          >
            <div className="px-8 py-3">
              <div className="overflow-auto max-h-80">
                <table className="w-full text-xs table-fixed">
                  <thead
                    className="sticky top-0 z-10"
                    style={{
                      backgroundColor: 'var(--vscode-editor-background)',
                    }}
                  >
                    <tr
                      style={{
                        borderBottom: `1px solid ${themeColors.border}`,
                      }}
                    >
                      <th
                        className="text-left py-2 pr-2 font-medium w-28"
                        style={{ color: themeColors.muted }}
                      >
                        Column
                      </th>
                      {Object.keys(
                        Object.values(row_diff.column_stats)[0] || {},
                      ).map(stat => (
                        <th
                          key={stat}
                          className="text-left py-2 px-1 font-medium w-16"
                          title={stat}
                          style={{ color: themeColors.muted }}
                        >
                          {stat.length > 6 ? stat.slice(0, 6) + '..' : stat}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(row_diff.column_stats).map(
                      ([col, statsValue]) => (
                        <tr
                          key={col}
                          className="transition-colors"
                          style={{
                            borderBottom: `1px solid ${themeColors.border}`,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor =
                              'var(--vscode-list-hoverBackground)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor =
                              'transparent'
                          }}
                        >
                          <td
                            className="py-2 pr-2 font-mono truncate"
                            title={col}
                          >
                            {col}
                          </td>
                          {statsValue && typeof statsValue === 'object'
                            ? Object.values(
                                statsValue as Record<string, SampleValue>,
                              ).map((value: SampleValue, idx: number) => (
                                <td
                                  key={idx}
                                  className="py-2 px-1 font-mono text-xs truncate"
                                  title={String(value)}
                                  style={{ color: themeColors.muted }}
                                >
                                  {typeof value === 'number'
                                    ? value.toFixed(1)
                                    : String(value).length > 8
                                      ? String(value).slice(0, 8) + '..'
                                      : String(value)}
                                </td>
                              ))
                            : [
                                <td
                                  key="single-value"
                                  className="py-2 px-1 font-mono text-xs truncate"
                                  title={String(statsValue)}
                                  style={{ color: themeColors.muted }}
                                >
                                  {typeof statsValue === 'number'
                                    ? statsValue.toFixed(1)
                                    : String(statsValue)}
                                </td>,
                              ]}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionToggle>
        )}

        {/* Sample Data */}
        {Object.keys(row_diff.joined_sample || {}).length > 0 && (
          <SectionToggle
            id="sampleData"
            title="Sample Data"
            badgeStyle={{
              backgroundColor: 'var(--vscode-input-background)',
              color: 'var(--vscode-symbolIcon-arrayForeground, #f97316)',
              borderColor: 'var(--vscode-symbolIcon-arrayForeground, #f97316)',
            }}
            expanded={expanded.sampleData}
            onToggle={() => toggle('sampleData')}
          >
            <SampleDataSection rowDiff={row_diff} />
          </SectionToggle>
        )}
      </div>
    </div>
  )
}
