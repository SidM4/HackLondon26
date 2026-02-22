'use client'

import { useAnalysisStore } from '@/store/analysisStore'
import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function Counter({ from, to }: { from: number; to: number }) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let start = from
    const duration = 1800
    const fps = 60
    const frames = Math.round((duration / 1000) * fps)
    const increment = (to - from) / frames
    let currentFrame = 0

    const timer = setInterval(() => {
      currentFrame++
      start += increment
      if (currentFrame >= frames) {
        setCount(to)
        clearInterval(timer)
      } else {
        setCount(Math.round(start))
      }
    }, 1000 / fps)

    return () => clearInterval(timer)
  }, [from, to])

  return <span>{count}</span>
}

export function ApprovalDisplay() {
  const analyseResult = useAnalysisStore((s) => s.analyseResult)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  if (!analyseResult) return null

  const pct = Math.round(analyseResult.approval_probability * 100)
  const confidencePct = Math.round(analyseResult.confidence * 100)

  const getColors = (val: number) => {
    if (val >= 75) return { text: 'text-blueprint-teal', bg: 'bg-blueprint-teal', label: 'High Likelihood', icon: TrendingUp }
    if (val >= 40) return { text: 'text-copper', bg: 'bg-copper', label: 'Moderate', icon: Minus }
    return { text: 'text-red-500', bg: 'bg-red-500', label: 'Low Likelihood', icon: TrendingDown }
  }

  const colors = getColors(pct)
  const Icon = colors.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-card"
      role="region"
      aria-label="Council approval probability"
    >
      {/* Top progress bar */}
      <div className="w-full h-1 bg-neutral-100 rounded-full mb-8">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
          className={`h-full ${colors.bg} rounded-full`}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-blue">
              Approval Probability
            </h2>
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold ${colors.bg}/10 ${colors.text}`}>
              <Icon className="h-3 w-3" />
              {colors.label}
            </span>
          </div>
          <p className="text-sm text-slate-blue/40 max-w-sm leading-relaxed">
            Based on historical planning decisions in your area, this type of work has a{' '}
            <strong className="font-semibold text-slate-blue">{pct}%</strong> chance of council approval.
          </p>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end">
          <div className="flex items-baseline gap-0.5">
            <span className={`heading-display text-6xl sm:text-7xl tabular-nums ${colors.text}`}>
              {isInView ? <Counter from={0} to={pct} /> : '0'}
            </span>
            <span className={`text-2xl font-light ${colors.text}`}>%</span>
          </div>
          <span className="mt-2 text-xs font-medium text-slate-blue/40">
            &plusmn;{confidencePct}% confidence interval
          </span>
        </div>
      </div>
    </motion.div>
  )
}
