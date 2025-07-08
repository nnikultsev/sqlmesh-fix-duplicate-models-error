import { SectionToggle } from './SectionToggle'
import { SchemaDiffSection } from './SchemaDiffSection'
import { RowStatsSection } from './RowStatsSection'
import { ColumnStatsSection } from './ColumnStatsSection'
import { SampleDataSection } from './SampleDataSection'
import { usePersistedState } from './hooks'
import { type TableDiffData, type ExpandedSections } from './types'
import { twColors, twMerge } from './tailwind-utils'

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
      <div className={twMerge('p-4', twColors.textForeground)}>
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
      className={twMerge(
        'h-full w-full text-[13px] font-sans',
        twColors.bgEditor,
        twColors.textForeground
      )}
    >
      {/* Header */}
      <div
        className={twMerge(
          'px-4 py-3 space-y-2 sticky top-0 z-20 border-b',
          twColors.borderPanel,
          twColors.bgEditor
        )}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className={twMerge('text-sm font-medium', twColors.textInfo)}>
            Source:
          </span>
          <code
            className={twMerge(
              'px-2 py-1 rounded text-sm whitespace-nowrap border',
              twColors.textInfo,
              twColors.bgInput,
              twColors.borderPanel
            )}
          >
            {schema_diff.source}
          </code>
          <span className={twMerge('text-sm font-medium ml-4', twColors.textSuccess)}>
            Target:
          </span>
          <code
            className={twMerge(
              'px-2 py-1 rounded text-sm whitespace-nowrap border',
              twColors.textSuccess,
              twColors.bgInput,
              twColors.borderPanel
            )}
          >
            {schema_diff.target}
          </code>
        </div>
        <div className="flex items-center gap-6 text-xs flex-wrap">
          <span className={twColors.textInfo}>
            Source rows:{' '}
            <span className="font-medium">
              {formatCount(row_diff.source_count)}
            </span>
          </span>
          <span className={twColors.textSuccess}>
            Target rows:{' '}
            <span className="font-medium">
              {formatCount(row_diff.target_count)}
            </span>
          </span>
          <span
            className={
              row_diff.count_pct_change > 0
                ? twColors.textSuccess
                : row_diff.count_pct_change < 0
                  ? twColors.textError
                  : twColors.textMuted
            }
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
            badgeClassName={twMerge(
              'px-2 py-1 text-xs rounded border',
              twColors.bgInput,
              twColors.textAccent,
              'border-[var(--vscode-textLink-foreground)]'
            )}
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
