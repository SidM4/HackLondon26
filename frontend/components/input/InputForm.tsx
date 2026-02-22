'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAnalysisStore, defaultInputs, type AnalysisInputs } from '@/store/analysisStore'
import { analyse } from '@/lib/api/client'
import type { AnalyseResponse } from '@/lib/types/api'
import { PostcodeInput } from './PostcodeInput'
import { PropertyDescriptionTextarea } from './PropertyDescriptionTextarea'
import { PropertyDetailsFields } from './PropertyDetailsFields'
import { WorkTypeSelector } from './WorkTypeSelector'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const REPORT_STORAGE_KEY = 'meridian:latest-report'

/* ------------------------------------------------------------------ */
/*  Step badge                                                          */
/* ------------------------------------------------------------------ */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-blue text-[10px] font-bold text-white">
      {n}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */

const smoothEase: [number, number, number, number] = [0.25, 1, 0.5, 1]

const stepChild = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      opacity: { duration: 0.36, ease: 'easeOut' as const },
      y: { duration: 0.52, ease: smoothEase },
      scale: { duration: 0.52, ease: smoothEase },
    },
  },
}

/* ------------------------------------------------------------------ */
/*  Divider                                                             */
/* ------------------------------------------------------------------ */

function StepDivider() {
  return <div className="h-px bg-neutral-100 my-7" />
}

/* ------------------------------------------------------------------ */
/*  Main form                                                           */
/* ------------------------------------------------------------------ */

export function InputForm() {
  const [local, setLocal] = useState<AnalysisInputs>(defaultInputs)
  const [revealedSteps, setRevealedSteps] = useState(0)
  const { setInputs, setAnalyseResult, setLoading, setError, loading } =
    useAnalysisStore()

  useEffect(() => {
    let nextStep = 0
    const timer = window.setInterval(() => {
      nextStep += 1
      setRevealedSteps(nextStep)
      if (nextStep >= 5) {
        window.clearInterval(timer)
      }
    }, 170)

    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!local.postcode.trim() || !local.work_type) return

      const reportWindow =
        typeof window !== 'undefined' ? window.open('/report', '_blank') : null

      setLoading(true)
      setError(null)
      try {
        const result: AnalyseResponse = await analyse({
          postcode: local.postcode,
          property_description: local.property_description,
          work_type: local.work_type,
        })

        if (typeof window !== 'undefined') {
          const payload = JSON.stringify({
            inputs: local,
            analyseResult: result,
            createdAt: new Date().toISOString(),
          })
          window.localStorage.setItem(REPORT_STORAGE_KEY, payload)
        }

        if (reportWindow) {
          reportWindow.focus()
          return
        }

        // Fallback if browser blocks popups.
        setInputs(local)
        setAnalyseResult(result)
      } catch (err) {
        if (reportWindow && !reportWindow.closed) {
          reportWindow.close()
        }
        setError(err instanceof Error ? err.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    },
    [local, setInputs, setAnalyseResult, setLoading, setError]
  )

  const isDisabled = !local.postcode.trim() || !local.work_type || loading

  return (
    <form onSubmit={handleSubmit}>
      <div>
        {/* Step 1: Postcode */}
        {revealedSteps >= 1 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stepChild}
          className="rounded-2xl border border-transparent p-1"
        >
          <div className="flex items-center gap-2 mb-3">
            <StepBadge n={1} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-blue/40">
              Location
            </span>
          </div>
          <PostcodeInput
            value={local.postcode}
            onChange={(postcode) => setLocal((p) => ({ ...p, postcode }))}
            disabled={loading}
          />
        </motion.div>
        )}

        {/* Divider */}
        {revealedSteps >= 2 && (
          <motion.div initial="hidden" animate="visible" variants={stepChild}>
            <StepDivider />
          </motion.div>
        )}

        {/* Step 2: Property description textarea */}
        {revealedSteps >= 2 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stepChild}
            className="rounded-2xl border border-transparent p-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <StepBadge n={2} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-blue/40">
                Property Description
              </span>
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-slate-blue/35">
                optional
              </span>
            </div>
            <PropertyDescriptionTextarea
              value={local.property_description}
              onChange={(property_description) =>
                setLocal((p) => ({ ...p, property_description }))
              }
              disabled={loading}
            />
          </motion.div>
        )}

        {revealedSteps >= 3 && (
          <motion.div initial="hidden" animate="visible" variants={stepChild}>
            <StepDivider />
          </motion.div>
        )}

        {/* Step 3: Property details (type, bedrooms, bathrooms) */}
        {revealedSteps >= 3 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stepChild}
            className="rounded-2xl border border-transparent p-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <StepBadge n={3} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-blue/40">
                Property Details
              </span>
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-slate-blue/35">
                optional
              </span>
            </div>
            <PropertyDetailsFields
              value={local.property_description}
              onChange={(property_description) =>
                setLocal((p) => ({ ...p, property_description }))
              }
              disabled={loading}
            />
          </motion.div>
        )}

        {revealedSteps >= 4 && (
          <motion.div initial="hidden" animate="visible" variants={stepChild}>
            <StepDivider />
          </motion.div>
        )}

        {/* Step 4: Work type */}
        {revealedSteps >= 4 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stepChild}
            className="rounded-2xl border border-transparent p-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <StepBadge n={4} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-blue/40">
                Type of Work
              </span>
            </div>
            <WorkTypeSelector
              value={local.work_type}
              onChange={(work_type) => setLocal((p) => ({ ...p, work_type }))}
              disabled={loading}
            />
          </motion.div>
        )}

        {revealedSteps >= 5 && (
          <motion.div initial="hidden" animate="visible" variants={stepChild}>
            <StepDivider />
          </motion.div>
        )}

        {/* Submit */}
        {revealedSteps >= 5 && (
          <motion.div initial="hidden" animate="visible" variants={stepChild}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-slate-blue/35 max-w-sm">
                Matched against thousands of past planning decisions in your
                local authority area.
              </p>
              <button
                type="submit"
                disabled={isDisabled}
                className="group w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 rounded-xl bg-slate-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-blue/90 focus:outline-none focus:ring-2 focus:ring-slate-blue/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Analysing&hellip;
                  </>
                ) : (
                  <>
                    Analyse Project
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </form>
  )
}
