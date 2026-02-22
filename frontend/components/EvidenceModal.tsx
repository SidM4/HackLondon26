'use client'

import { useState, useCallback } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { PrecedentItem } from './results/PrecedentItem'
import type { Precedent } from '@/lib/types/api'

interface EvidenceModalProps {
  open: boolean
  onClose: () => void
}

export function EvidenceModal({ open, onClose }: EvidenceModalProps) {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const [search, setSearch] = useState('')
  const [filterDecision, setFilterDecision] = useState<'all' | 'approved' | 'refused'>('all')

  const precedents = analyseResult?.precedents ?? []
  const filtered = precedents.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.app_id.toLowerCase().includes(search.toLowerCase())
    const matchDecision =
      filterDecision === 'all' || p.decision === filterDecision
    return matchSearch && matchDecision
  })

  const copyCitation = useCallback((p: Precedent) => {
    const text = `${p.app_id}: ${p.url ?? ''}`
    navigator.clipboard.writeText(text)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="evidence-modal-title" className="text-lg font-semibold">
            Evidence & precedents
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="border-b border-neutral-200 px-6 py-3 space-y-2">
          <input
            type="search"
            placeholder="Search by title or app ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            aria-label="Search precedents"
          />
          <div className="flex gap-2">
            {(['all', 'approved', 'refused'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterDecision(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${filterDecision === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filtered.map((p) => (
            <div key={p.app_id} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <PrecedentItem precedent={p} compact />
              </div>
              <button
                type="button"
                onClick={() => copyCitation(p)}
                className="shrink-0 rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                aria-label={`Copy citation for ${p.app_id}`}
              >
                Copy citation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
