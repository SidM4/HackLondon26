'use client'

import { useEffect, useState } from 'react'
import type { AnalyseResponse } from '@/lib/types/api'
import { useAnalysisStore, type AnalysisInputs } from '@/store/analysisStore'
import { ApprovalDisplay } from '@/components/results/ApprovalDisplay'
import { PrecedentsList } from '@/components/results/PrecedentsList'
import { SuggestedImprovements } from '@/components/results/SuggestedImprovements'
import { ReportDownload } from '@/components/results/ReportDownload'
import { motion } from 'framer-motion'

const REPORT_STORAGE_KEY = 'meridian:latest-report'

interface StoredReportPayload {
  inputs: AnalysisInputs
  analyseResult: AnalyseResponse
  createdAt: string
}

export default function ReportPage() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const setInputs = useAnalysisStore((s) => s.setInputs)
  const setAnalyseResult = useAnalysisStore((s) => s.setAnalyseResult)
  const [waitingForReport, setWaitingForReport] = useState(!analyseResult)

  useEffect(() => {
    if (analyseResult) {
      setWaitingForReport(false)
      return
    }

    let attempts = 0
    const maxAttempts = 60

    const hydrateFromStorage = () => {
      const raw = window.localStorage.getItem(REPORT_STORAGE_KEY)
      if (!raw) return false

      try {
        const payload = JSON.parse(raw) as StoredReportPayload
        if (!payload?.analyseResult) return false
        setInputs(payload.inputs ?? null)
        setAnalyseResult(payload.analyseResult)
        setWaitingForReport(false)
        return true
      } catch {
        return false
      }
    }

    if (hydrateFromStorage()) return

    const timer = window.setInterval(() => {
      attempts += 1
      if (hydrateFromStorage()) {
        window.clearInterval(timer)
        return
      }
      if (attempts >= maxAttempts) {
        setWaitingForReport(false)
        window.clearInterval(timer)
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [analyseResult, setAnalyseResult, setInputs])

  return (
    <main className="min-h-screen bg-[#f2f5f8]">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-8 rounded-2xl border border-slate-blue/10 bg-white p-6 sm:p-8 shadow-card"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-slate-blue sm:text-4xl">
            Project Report
          </h1>
          <p className="mt-2 text-sm text-slate-blue/45">
            Your analysis output appears here in a dedicated tab.
          </p>
        </motion.div>

        {waitingForReport && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-slate-blue/45 shadow-card">
            Generating your report...
          </div>
        )}

        {!waitingForReport && !analyseResult && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-slate-blue/45 shadow-card">
            No report found yet. Run an analysis from the input page to populate this tab.
          </div>
        )}

        {!waitingForReport && analyseResult && (
          <div className="space-y-6">
            <ApprovalDisplay />
            <PrecedentsList />
            <SuggestedImprovements />
            <div className="flex justify-end pt-2">
              <ReportDownload />
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
