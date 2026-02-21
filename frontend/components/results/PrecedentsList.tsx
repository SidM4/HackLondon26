'use client'

import { useAnalysisStore } from '@/store/analysisStore'
import { PrecedentItem } from './PrecedentItem'

export function PrecedentsList() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const setSelectedPrecedent = useAnalysisStore((s) => s.setSelectedPrecedent)

  if (!analyseResult || !analyseResult.precedents?.length) return null

  return (
    <section aria-labelledby="precedents-heading">
      <h2 id="precedents-heading" className="text-xl font-semibold text-neutral-900 mb-4">
        Previous Changes in Your Area
      </h2>
      <p className="text-sm text-neutral-600 mb-4">
        Examples of similar planning applications near your postcode:
      </p>
      <ul className="space-y-3">
        {analyseResult.precedents.map((p) => (
          <li key={p.app_id}>
            <PrecedentItem
              precedent={p}
              onSelect={() => setSelectedPrecedent(p)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
