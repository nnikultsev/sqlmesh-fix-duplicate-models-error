import { type ReactNode } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { type ExpandedSections } from './types'

interface SectionToggleProps {
  id: keyof ExpandedSections
  title: string
  badge?: string
  badgeStyle?: React.CSSProperties
  expanded: boolean
  onToggle(): void
  children: ReactNode
}

export function SectionToggle({
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
        className="overflow-hidden transition-all duration-200"
        style={{
          maxHeight: expanded ? '100vh' : '0px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
