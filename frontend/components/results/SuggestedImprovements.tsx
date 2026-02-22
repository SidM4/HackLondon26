'use client'

import { useAnalysisStore } from '@/store/analysisStore'
import type { SuggestedImprovement } from '@/lib/types/api'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Lightbulb, TrendingUp, PoundSterling } from 'lucide-react'

function ImprovementCard({ improvement, index }: { improvement: SuggestedImprovement; index: number }) {
  const approvalPct = Math.round(improvement.approval_probability * 100)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-bold text-slate-blue pr-2 leading-snug">
          {improvement.work_type_label}
        </h3>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-blueprint-teal/10 px-2.5 py-1 text-xs font-bold text-blueprint-teal">
          {approvalPct}%
        </span>
      </div>

      <p className="text-sm text-slate-blue/40 leading-relaxed mb-5">{improvement.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2.5">
          <PoundSterling className="h-4 w-4 text-slate-blue/30 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-blue/30 font-semibold">Cost</p>
            <p className="text-sm font-bold text-slate-blue tabular-nums">
              &pound;{improvement.estimated_cost.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-blue/30 font-semibold">Value</p>
            <p className="text-sm font-bold text-emerald-600 tabular-nums">
              +&pound;{improvement.value_added.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export function SuggestedImprovements() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  if (!analyseResult || !analyseResult.suggested_improvements?.length) return null

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      aria-labelledby="improvements-heading"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Lightbulb className="h-5 w-5 text-copper" />
          <h2 id="improvements-heading" className="text-lg font-bold text-slate-blue">
            Suggested Improvements
          </h2>
        </div>
        {analyseResult.location_insights && (
          <p className="mt-2 text-sm text-slate-blue/40 leading-relaxed ml-8">
            {analyseResult.location_insights}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analyseResult.suggested_improvements.map((imp, idx) => (
          <ImprovementCard key={idx} improvement={imp} index={idx} />
        ))}
      </div>
    </motion.section>
  )
}
