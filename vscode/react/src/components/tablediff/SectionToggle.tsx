import { type ReactNode } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { type ExpandedSections } from './types'
import { twColors, twMerge } from './tailwind-utils'

interface SectionToggleProps {
  id: keyof ExpandedSections
  title: string
  badge?: string
  badgeStyle?: React.CSSProperties
  badgeClassName?: string
  expanded: boolean
  onToggle(): void
  children: ReactNode
}

export function SectionToggle({
  title,
  badge,
  badgeStyle,
  badgeClassName,
  expanded,
  onToggle,
  children,
}: SectionToggleProps) {
  return (
    <div className={twMerge('border-b', twColors.borderPanel)}>
      <button
        onClick={onToggle}
        className={twMerge(
          'w-full px-4 py-2 flex items-center text-left select-none transition-colors',
          twColors.textForeground,
          twColors.bgHover,
        )}
      >
        {expanded ? (
          <ChevronDownIcon className="w-4 h-4 mr-2 shrink-0 transition-transform" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 mr-2 shrink-0 transition-transform" />
        )}
        <span className="font-medium flex-1">{title}</span>
        {badge && (
          <span
            className={
              badgeClassName || 'text-xs px-2 py-0.5 rounded ml-2 border'
            }
            style={badgeStyle}
          >
            {badge}
          </span>
        )}
      </button>
      <div
        className={twMerge(
          'overflow-hidden transition-all duration-200',
          expanded ? 'max-h-screen' : 'max-h-0',
        )}
      >
        {children}
      </div>
    </div>
  )
}
