'use client'

import type { Precedent } from '@/lib/types/api'

interface PrecedentItemProps {
  precedent: Precedent
  onSelect?: () => void
  compact?: boolean
}

export function PrecedentItem({ precedent, onSelect, compact }: PrecedentItemProps) {
  const isApproved = precedent.decision === 'approved'
  return (
    <article
      className={`rounded-lg border border-neutral-200 bg-white ${compact ? 'p-3' : 'p-4'} ${onSelect ? 'cursor-pointer hover:border-neutral-300' : ''}`}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900">{precedent.title}</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {precedent.app_id} · {precedent.date}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {precedent.decision}
        </span>
      </div>
      {precedent.url && !compact && (
        <a
          href={precedent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          View application →
        </a>
      )}
    </article>
  )
}
