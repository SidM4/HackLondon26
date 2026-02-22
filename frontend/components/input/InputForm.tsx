'use client'

import { useState, useCallback } from 'react'
import { useAnalysisStore, defaultInputs, type AnalysisInputs } from '@/store/analysisStore'
import { analyse } from '@/lib/api/client'
import { PostcodeInput } from './PostcodeInput'
import { PropertyDescriptionInput } from './PropertyDescriptionInput'
import { WorkTypeSelector } from './WorkTypeSelector'

export function InputForm() {
  const [local, setLocal] = useState<AnalysisInputs>(defaultInputs)
  const {
    setInputs,
    setAnalyseResult,
    setLoading,
    setError,
  } = useAnalysisStore()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!local.postcode.trim() || !local.work_type) return
      setLoading(true)
      setError(null)
      try {
        const result = await analyse({
          postcode: local.postcode,
          property_description: local.property_description,
          work_type: local.work_type,
        })
        setInputs(local)
        setAnalyseResult(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    },
    [local, setInputs, setAnalyseResult, setLoading, setError]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PostcodeInput
        value={local.postcode}
        onChange={(postcode) => setLocal((p) => ({ ...p, postcode }))}
      />
      <PropertyDescriptionInput
        value={local.property_description}
        onChange={(property_description) =>
          setLocal((p) => ({ ...p, property_description }))
        }
      />
      <WorkTypeSelector
        value={local.work_type}
        onChange={(work_type) => setLocal((p) => ({ ...p, work_type }))}
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-60"
        aria-label="Analyse"
        disabled={!local.postcode.trim() || !local.work_type}
      >
        Analyse
      </button>
    </form>
  )
}
