'use client'

import { useState } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { InputForm } from '@/components/input/InputForm'
import { ApprovalDisplay } from '@/components/results/ApprovalDisplay'
import { PrecedentsList } from '@/components/results/PrecedentsList'
import { SuggestedImprovements } from '@/components/results/SuggestedImprovements'
import { ReportDownload } from '@/components/results/ReportDownload'
import { EvidenceModal } from '@/components/EvidenceModal'

export default function Home() {
  const hasResults = useAnalysisStore((s) => s.analyseResult != null)
  const loading = useAnalysisStore((s) => s.loading)
  const error = useAnalysisStore((s) => s.error)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  return (
    <main className="min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              aria-labelledby="input-heading"
            >
              <h1 id="input-heading" className="text-xl font-semibold text-neutral-900">
                Analyse your renovation
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Enter your postcode, property details, and proposed work to see council approval probability and suggested improvements.
              </p>
              <div className="mt-6">
                <InputForm />
              </div>
              {loading && (
                <p className="mt-4 text-sm text-neutral-500" role="status">
                  Analysing…
                </p>
              )}
              {error && (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </section>

            {hasResults && (
              <>
                <ApprovalDisplay />
                <PrecedentsList />
                <SuggestedImprovements />
                <div className="flex justify-end pt-4">
                  <ReportDownload />
                </div>
              </>
            )}
        </div>
      </div>

      <EvidenceModal
        open={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
      />
    </main>
  )
}
