'use client'

import type { Precedent } from '@/lib/types/api'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'

interface PrecedentItemProps {
  precedent: Precedent
  onSelect?: () => void
  compact?: boolean
}

export function PrecedentItem({ precedent, onSelect, compact }: PrecedentItemProps) {
  const isApproved = precedent.decision === 'approved'
  return (
    <article
      className={`group rounded-xl border bg-white transition-all duration-200 ${
        compact ? 'p-3 border-neutral-100' : 'p-4 border-neutral-200 hover:shadow-card'
      } ${onSelect ? 'cursor-pointer hover:border-slate-blue/20' : ''}`}
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-blue text-sm leading-snug">{precedent.title}</p>
          <p className="mt-1 text-xs text-slate-blue/30">
            {precedent.app_id} &middot; {precedent.date}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
            isApproved
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {isApproved ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {precedent.decision}
        </span>
      </div>
      {precedent.url && !compact && (
        <a
          href={precedent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-blue/50 hover:text-slate-blue transition-colors link-underline"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" />
          View application
        </a>
      )}
    </article>
  )
}
