'use client'

import { useAnalysisStore } from '@/store/analysisStore'
import { PrecedentItem } from './PrecedentItem'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FileText } from 'lucide-react'

export function PrecedentsList() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const setSelectedPrecedent = useAnalysisStore((s) => s.setSelectedPrecedent)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  if (!analyseResult || !analyseResult.precedents?.length) return null

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      aria-labelledby="precedents-heading"
      className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-card"
    >
      <div className="flex items-center gap-3 mb-1">
        <FileText className="h-5 w-5 text-slate-blue/40" />
        <h2 id="precedents-heading" className="text-lg font-bold text-slate-blue">
          Previous Changes in Your Area
        </h2>
      </div>
      <p className="text-sm text-slate-blue/30 mb-6 ml-8">
        Similar planning applications near your postcode
      </p>
      <ul className="space-y-2">
        {analyseResult.precedents.map((p, idx) => (
          <motion.li
            key={p.app_id}
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
          >
            <PrecedentItem
              precedent={p}
              onSelect={() => setSelectedPrecedent(p)}
            />
          </motion.li>
        ))}
      </ul>
    </motion.section>
  )
}
