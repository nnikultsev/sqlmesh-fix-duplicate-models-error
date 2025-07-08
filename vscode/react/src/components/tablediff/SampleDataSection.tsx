import { useMemo } from 'react'
import {
  type TableDiffData,
  type SampleRow,
  type SampleValue,
  themeColors,
  formatCellValue,
} from './types'

interface SampleDataSectionProps {
  rowDiff: TableDiffData['row_diff']
}

interface TableHeaderCellProps {
  columnKey: string
  sourceName?: SampleValue
  targetName?: SampleValue
}

const TableHeaderCell = ({ columnKey, sourceName, targetName }: TableHeaderCellProps) => {
  const isSource = columnKey === sourceName
  const isTarget = columnKey === targetName
  
  return (
    <th
      className="text-left py-2 px-2 font-medium whitespace-nowrap"
      style={{
        color: isSource
          ? themeColors.info
          : isTarget
            ? themeColors.success
            : themeColors.muted,
      }}
    >
      {columnKey}
    </th>
  )
}

interface DiffTableCellProps {
  columnKey: string
  value: SampleValue
  sourceName?: SampleValue
  targetName?: SampleValue
  decimals?: number
}

const DiffTableCell = ({ columnKey, value, sourceName, targetName, decimals = 3 }: DiffTableCellProps) => {
  const isSource = columnKey === sourceName
  const isTarget = columnKey === targetName
  
  return (
    <td
      className="py-2 px-2 font-mono whitespace-nowrap"
      style={{
        color: isSource
          ? themeColors.info
          : isTarget
            ? themeColors.success
            : 'var(--vscode-editor-foreground)',
        backgroundColor: isSource
          ? 'var(--vscode-diffEditor-insertedTextBackground, rgba(59, 130, 246, 0.1))'
          : isTarget
            ? 'var(--vscode-diffEditor-removedTextBackground, rgba(34, 197, 94, 0.1))'
            : 'transparent',
      }}
    >
      {formatCellValue(value, decimals)}
    </td>
  )
}

interface DiffTableRowProps {
  row: SampleRow
  sourceName?: SampleValue
  targetName?: SampleValue
  decimals?: number
}

const DiffTableRow = ({ row, sourceName, targetName, decimals }: DiffTableRowProps) => (
  <tr
    className="transition-colors"
    style={{
      borderBottom: `1px solid ${themeColors.border}`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'var(--vscode-list-hoverBackground)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'transparent'
    }}
  >
    {Object.entries(row)
      .filter(([key]) => !key.startsWith('__'))
      .map(([key, cell]) => (
        <DiffTableCell
          key={key}
          columnKey={key}
          value={cell}
          sourceName={sourceName}
          targetName={targetName}
          decimals={decimals}
        />
      ))}
  </tr>
)

interface SimpleTableCellProps {
  value: SampleValue
  color: string
  decimals?: number
}

const SimpleTableCell = ({ value, color, decimals = 3 }: SimpleTableCellProps) => (
  <td
    className="py-2 px-2 font-mono whitespace-nowrap"
    style={{ color }}
  >
    {formatCellValue(value, decimals)}
  </td>
)

interface SimpleTableRowProps {
  row: SampleRow
  color: string
  borderColor: string
  decimals?: number
}

const SimpleTableRow = ({ row, color, borderColor, decimals }: SimpleTableRowProps) => (
  <tr
    className="transition-colors"
    style={{
      borderBottom: `1px solid ${borderColor}`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'var(--vscode-list-hoverBackground)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'transparent'
    }}
  >
    {Object.values(row).map((cell, cellIdx) => (
      <SimpleTableCell
        key={cellIdx}
        value={cell}
        color={color}
        decimals={decimals}
      />
    ))}
  </tr>
)

interface ColumnDifferenceGroupProps {
  columnName: string
  rows: SampleRow[]
  decimals: number
}

const ColumnDifferenceGroup = ({ columnName, rows, decimals }: ColumnDifferenceGroupProps) => {
  if (!rows || rows.length === 0) return null

  const sourceName = rows[0].__source_name__
  const targetName = rows[0].__target_name__

  return (
    <div
      className="border rounded-lg p-4"
      style={{
        backgroundColor: 'var(--vscode-editor-inactiveSelectionBackground)',
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
                  <TableHeaderCell
                    key={key}
                    columnKey={key}
                    sourceName={sourceName}
                    targetName={targetName}
                  />
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, rowIdx) => (
              <DiffTableRow
                key={rowIdx}
                row={row}
                sourceName={sourceName}
                targetName={targetName}
                decimals={decimals}
              />
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
            {Object.entries(groupedDifferences).map(([columnName, rows]) => (
              <ColumnDifferenceGroup
                key={columnName}
                columnName={columnName}
                rows={rows}
                decimals={decimals}
              />
            ))}
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
                  {source_only.slice(0, 10).map((row, rowIdx) => (
                    <SimpleTableRow
                      key={rowIdx}
                      row={row}
                      color={themeColors.modifiedText}
                      borderColor={themeColors.modifiedText}
                      decimals={decimals}
                    />
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
                  {target_only.slice(0, 10).map((row, rowIdx) => (
                    <SimpleTableRow
                      key={rowIdx}
                      row={row}
                      color={themeColors.addedText}
                      borderColor={themeColors.addedText}
                      decimals={decimals}
                    />
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