import { SectionToggle } from './SectionToggle'
import { type TableDiffData, themeColors } from './types'

interface RowStatsSectionProps {
  rowDiff: TableDiffData['row_diff']
  expanded: boolean
  onToggle: () => void
}

export function RowStatsSection({
  rowDiff,
  expanded,
  onToggle,
}: RowStatsSectionProps) {
  const formatPercentage = (v: number) => `${(v * 100).toFixed(1)}%`
  const formatCount = (v: number) => v.toLocaleString()

  const fullMatchCount = Math.round(rowDiff.stats.full_match_count || 0)
  const joinCount = Math.round(rowDiff.stats.join_count || 0)
  const partialMatchCount = joinCount - fullMatchCount
  const sOnlyCount = Math.round(rowDiff.stats.s_only_count || 0)
  const tOnlyCount = Math.round(rowDiff.stats.t_only_count || 0)
  const totalRows = rowDiff.source_count + rowDiff.target_count
  const fullMatchPct = totalRows > 0 ? (2 * fullMatchCount) / totalRows : 0

  return (
    <SectionToggle
      id="rows"
      title="Row Statistics"
      badge={`${formatPercentage(fullMatchPct)} match rate`}
      badgeStyle={{
        backgroundColor: 'var(--vscode-input-background)',
        color: themeColors.info,
        borderColor: themeColors.info,
      }}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="px-8 py-3 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span style={{ color: themeColors.success }}>✓ Full Matches</span>
              <span className="font-medium">{formatCount(fullMatchCount)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.info }}>~ Partial Matches</span>
              <span className="font-medium">
                {formatCount(partialMatchCount)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span style={{ color: themeColors.warning }}>+ Source Only</span>
              <span className="font-medium">{formatCount(sOnlyCount)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.error }}>- Target Only</span>
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
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--vscode-input-background)' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${fullMatchPct * 100}%`,
                backgroundColor: themeColors.success,
              }}
            />
          </div>
        </div>
      </div>
    </SectionToggle>
  )
}
