'use client'

import { useAnalysisStore } from '@/store/analysisStore'

export function ApprovalDisplay() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)

  if (!analyseResult) return null

  const pct = Math.round(analyseResult.approval_probability * 100)
  const confidencePct = Math.round(analyseResult.confidence * 100)

  return (
    <div
      className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
      role="region"
      aria-label="Council approval probability"
    >
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Council Approval Probability
      </h2>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-light text-neutral-900">{pct}%</span>
        <span className="text-sm text-neutral-500">
          ±{confidencePct}% confidence
        </span>
      </div>
      <p className="mt-4 text-sm text-neutral-600">
        Based on historical planning decisions in your area, this type of work has a{' '}
        <strong>{pct}%</strong> chance of approval.
      </p>
    </div>
  )
}
