'use client'

import { useState, useCallback } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { PrecedentItem } from './results/PrecedentItem'
import type { Precedent } from '@/lib/types/api'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Copy, Check } from 'lucide-react'

interface EvidenceModalProps {
  open: boolean
  onClose: () => void
}

export function EvidenceModal({ open, onClose }: EvidenceModalProps) {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const [search, setSearch] = useState('')
  const [filterDecision, setFilterDecision] = useState<'all' | 'approved' | 'refused'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    setCopiedId(p.app_id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-blue/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-neutral-200"
              role="dialog"
              aria-modal="true"
              aria-labelledby="evidence-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <div>
                  <h2 id="evidence-modal-title" className="text-lg font-bold text-slate-blue">
                    Evidence &amp; Precedents
                  </h2>
                  <p className="text-xs text-slate-blue/30 mt-0.5">
                    {filtered.length} of {precedents.length} results
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-blue/30 hover:text-slate-blue hover:bg-neutral-100 transition-colors focus-ring"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filters */}
              <div className="border-b border-neutral-100 px-6 py-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-blue/30" />
                  <input
                    type="search"
                    placeholder="Search by title or application ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10 py-2.5 text-sm"
                    aria-label="Search precedents"
                  />
                </div>
                <div className="flex gap-1.5">
                  {(['all', 'approved', 'refused'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilterDecision(f)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        filterDecision === f
                          ? 'bg-slate-blue text-white'
                          : 'bg-neutral-50 text-slate-blue/40 hover:bg-neutral-100 hover:text-slate-blue/60'
                      }`}
                    >
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-blue/30">No matching precedents found.</p>
                  </div>
                ) : (
                  filtered.map((p) => (
                    <div key={p.app_id} className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <PrecedentItem precedent={p} compact />
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCitation(p)}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-blue/30 hover:text-slate-blue hover:bg-neutral-50 transition-all duration-200 focus-ring"
                        aria-label={`Copy citation for ${p.app_id}`}
                      >
                        {copiedId === p.app_id ? (
                          <>
                            <Check className="h-3 w-3 text-blueprint-teal" />
                            <span className="text-blueprint-teal">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Cite</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
