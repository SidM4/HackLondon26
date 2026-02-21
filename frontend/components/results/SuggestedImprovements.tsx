'use client'

import { useAnalysisStore } from '@/store/analysisStore'
import type { SuggestedImprovement } from '@/lib/types/api'

function ImprovementCard({ improvement }: { improvement: SuggestedImprovement }) {
  const approvalPct = Math.round(improvement.approval_probability * 100)
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-neutral-900">
          {improvement.work_type_label}
        </h3>
        <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          {approvalPct}% approval
        </span>
      </div>
      <p className="text-sm text-neutral-600 mb-4">{improvement.description}</p>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Est. cost</p>
          <p className="text-lg font-semibold text-neutral-900">
            £{improvement.estimated_cost.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1">Est. value added</p>
          <p className="text-lg font-semibold text-green-600">
            £{improvement.value_added.toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  )
}

export function SuggestedImprovements() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)

  if (!analyseResult || !analyseResult.suggested_improvements?.length) return null

  return (
    <section aria-labelledby="improvements-heading">
      <div className="mb-4">
        <h2 id="improvements-heading" className="text-xl font-semibold text-neutral-900">
          Suggested Home Improvements
        </h2>
        {analyseResult.location_insights && (
          <p className="mt-2 text-sm text-neutral-600">
            {analyseResult.location_insights}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analyseResult.suggested_improvements.map((imp, idx) => (
          <ImprovementCard key={idx} improvement={imp} />
        ))}
      </div>
    </section>
  )
}
