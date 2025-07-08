import { SectionToggle } from './SectionToggle'
import { SchemaDiffSection } from './SchemaDiffSection'
import { RowStatsSection } from './RowStatsSection'
import { ColumnStatsSection } from './ColumnStatsSection'
import { SampleDataSection } from './SampleDataSection'
import { usePersistedState } from './hooks'
import { type TableDiffData, type ExpandedSections, themeColors } from './types'

interface Props {
  data: TableDiffData
}

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
        style={{ color: 'var(--vscode-editor-foreground)' }}
      >
        No data available
      </div>
    )

  const { schema_diff, row_diff } = data

  const toggle = (section: keyof ExpandedSections) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const formatPercentage = (v: number) => `${(v * 100).toFixed(1)}%`
  const formatCount = (v: number) => v.toLocaleString()

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
              {formatPercentage(row_diff.count_pct_change)}
            </span>
          </span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="overflow-y-auto h-[calc(100%-120px)]">
        {/* Schema Changes */}
        <SchemaDiffSection
          schemaDiff={schema_diff}
          expanded={expanded.schema}
          onToggle={() => toggle('schema')}
        />

        {/* Row Statistics */}
        <RowStatsSection
          rowDiff={row_diff}
          expanded={expanded.rows}
          onToggle={() => toggle('rows')}
        />

        {/* Column Statistics */}
        <ColumnStatsSection
          columnStats={row_diff.column_stats}
          expanded={expanded.columnStats}
          onToggle={() => toggle('columnStats')}
        />

        {/* Sample Data */}
        {row_diff.processed_sample_data && (
          <SectionToggle
            id="sampleData"
            title="Sample Data"
            badge={`${(row_diff.processed_sample_data.column_differences?.length || 0) + (row_diff.processed_sample_data.source_only?.length || 0) + (row_diff.processed_sample_data.target_only?.length || 0)} rows`}
            badgeStyle={{
              backgroundColor: 'var(--vscode-input-background)',
              color: themeColors.accent,
              borderColor: themeColors.accent,
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
