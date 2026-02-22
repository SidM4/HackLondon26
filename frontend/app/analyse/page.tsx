'use client'

import { useState, useEffect } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { InputForm } from '@/components/input/InputForm'
import { HouseBuildingLoader } from '@/components/HouseBuildingLoader'
import { ApprovalDisplay } from '@/components/results/ApprovalDisplay'
import { PrecedentsList } from '@/components/results/PrecedentsList'
import { SuggestedImprovements } from '@/components/results/SuggestedImprovements'
import { ReportDownload } from '@/components/results/ReportDownload'
import { EvidenceModal } from '@/components/EvidenceModal'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, BarChart3, FileText, Lightbulb, Shield } from 'lucide-react'

export default function AnalysePage() {
  const hasResults = useAnalysisStore((s) => s.analyseResult != null)
  const loading = useAnalysisStore((s) => s.loading)
  const error = useAnalysisStore((s) => s.error)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen bg-neutral-100 overflow-hidden">
      {/* ============================================================
          HERO BANNER — dark slate-blue header with decorative orbs
          ============================================================ */}
      <section className="relative bg-slate-blue pt-28 pb-36 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-copper/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blueprint-teal/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
              Analyse your{' '}
              <span className="text-copper">project.</span>
            </h1>
            <p className="mt-5 text-lg text-white/50 max-w-xl font-light leading-relaxed">
              Fill in the details below to generate your custom report backed
              by historical planning data.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {[
              { icon: BarChart3, label: 'Approval Prediction' },
              { icon: FileText, label: 'Local Precedents' },
              { icon: Lightbulb, label: 'Smart Suggestions' },
              { icon: Shield, label: 'Risk Assessment' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] backdrop-blur-sm px-4 py-2 text-sm text-white/60"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FORM CARD — overlaps the hero banner
          ============================================================ */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
          className="rounded-3xl bg-white p-6 sm:p-10 shadow-xl shadow-slate-blue/10 border border-neutral-200/50"
          aria-labelledby="input-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-copper" />
            <h2
              id="input-heading"
              className="text-xs font-bold uppercase tracking-[0.15em] text-slate-blue/30"
            >
              Project Details
            </h2>
          </div>

          <InputForm />

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8"
                role="status"
              >
                <HouseBuildingLoader />
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 rounded-2xl bg-red-50 p-5 border border-red-100"
                role="alert"
              >
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* ============================================================
          RESULTS AREA — staggered entrance with section divider
          ============================================================ */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10 pb-20"
          >
            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
              className="mb-8 flex items-center gap-4"
            >
              <div className="h-px flex-1 bg-neutral-300" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-blue/30">
                Your Results
              </span>
              <div className="h-px flex-1 bg-neutral-300" />
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
              >
                <ApprovalDisplay />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              >
                <PrecedentsList />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6, ease: 'easeOut' }}
              >
                <SuggestedImprovements />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
                className="flex justify-end pt-4"
              >
                <ReportDownload />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EvidenceModal
        open={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
      />
    </main>
  )
}
