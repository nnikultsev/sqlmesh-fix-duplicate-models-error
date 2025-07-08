import { useMemo } from 'react'
import {
  type TableDiffData,
  type SampleRow,
  themeColors,
  formatCellValue,
} from './types'

interface SampleDataSectionProps {
  rowDiff: TableDiffData['row_diff']
}

export function SampleDataSection({ rowDiff }: SampleDataSectionProps) {
  const { processed_sample_data, decimals = 3 } = rowDiff

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
              backgroundColor:
                'var(--vscode-diffEditor-modifiedTextBackground, rgba(245, 158, 11, 0.2))',
              borderColor: themeColors.modifiedText,
            }}
          >
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead
                  className="sticky top-0 z-10"
                  style={{
                    backgroundColor:
                      'var(--vscode-diffEditor-modifiedTextBackground, rgba(245, 158, 11, 0.2))',
                  }}
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
              backgroundColor:
                'var(--vscode-diffEditor-insertedTextBackground, rgba(34, 197, 94, 0.2))',
              borderColor: themeColors.addedText,
            }}
          >
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead
                  className="sticky top-0 z-10"
                  style={{
                    backgroundColor:
                      'var(--vscode-diffEditor-insertedTextBackground, rgba(34, 197, 94, 0.2))',
                  }}
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
