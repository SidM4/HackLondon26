'use client'

import { useState, useCallback } from 'react'
import { useAnalysisStore, defaultInputs, type AnalysisInputs } from '@/store/analysisStore'
import { analyse } from '@/lib/api/client'
import { PostcodeInput } from './PostcodeInput'
import { PropertyDescriptionInput } from './PropertyDescriptionInput'
import { WorkTypeSelector } from './WorkTypeSelector'
import { ArrowRight } from 'lucide-react'

export function InputForm() {
  const [local, setLocal] = useState<AnalysisInputs>(defaultInputs)
  const {
    setInputs,
    setAnalyseResult,
    setLoading,
    setError,
    loading,
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

  const isDisabled = !local.postcode.trim() || !local.work_type || loading

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
        className="group w-full flex items-center justify-center gap-3 rounded-xl bg-slate-blue px-6 py-3.5 text-base font-semibold text-white hover:bg-slate-blue/90 transition-all duration-300 focus-ring disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        aria-label="Analyse"
        disabled={isDisabled}
      >
        {loading ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Analysing...
          </>
        ) : (
          <>
            Analyse Project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  )
}
