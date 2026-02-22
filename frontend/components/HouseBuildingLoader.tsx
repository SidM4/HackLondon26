'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const draw = (delay: number, duration = 0.6) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { delay, duration, ease: 'easeInOut' as const },
  },
})

const appear = (delay: number, duration = 0.5) => ({
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay, duration, ease: 'easeOut' as const },
  },
})

const rise = (delay: number, yFrom: number, duration = 0.6) => ({
  hidden: { opacity: 0, y: yFrom },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration, ease: [0.25, 1, 0.5, 1] as const },
  },
})

/* ------------------------------------------------------------------ */
/*  House SVG — one cycle of the build animation                       */
/* ------------------------------------------------------------------ */

function HouseSvg() {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      initial="hidden"
      animate="visible"
      className="overflow-visible"
    >
      {/* Ground line */}
      <motion.line
        x1="20" y1="170" x2="180" y2="170"
        stroke="#2C3E50" strokeWidth="3" strokeLinecap="round"
        variants={draw(0, 0.5)}
      />

      {/* Foundation */}
      <motion.rect
        x="45" y="158" width="110" height="12" rx="2"
        fill="#2C3E50" variants={rise(0.4, 20)}
      />

      {/* Left wall */}
      <motion.rect
        x="50" y="95" width="8" height="63"
        fill="#2C3E50" variants={rise(0.8, 30)}
      />
      {/* Right wall */}
      <motion.rect
        x="142" y="95" width="8" height="63"
        fill="#2C3E50" variants={rise(0.8, 30)}
      />

      {/* Wall fill */}
      <motion.rect
        x="58" y="100" width="84" height="58"
        fill="#E8D5C4" variants={rise(1.0, 20, 0.7)}
      />

      {/* Brick lines */}
      {[115, 130, 145].map((y, i) => (
        <motion.line
          key={`brick-h-${i}`}
          x1="58" y1={y} x2="142" y2={y}
          stroke="#2C3E50" strokeWidth="0.5" strokeOpacity="0.2"
          variants={draw(1.2 + i * 0.1, 0.3)}
        />
      ))}

      {/* Roof */}
      <motion.path
        d="M 35 98 L 100 45 L 165 98 Z"
        fill="#D35400" variants={rise(1.6, -30, 0.7)}
      />
      <motion.path
        d="M 35 98 L 100 45 L 165 98"
        stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        variants={draw(1.8, 0.6)}
      />

      {/* Door */}
      <motion.rect
        x="87" y="126" width="26" height="32" rx="3"
        fill="#2C3E50" variants={appear(2.2)}
      />
      <motion.circle cx="108" cy="144" r="2" fill="#D35400" variants={appear(2.5)} />

      {/* Left window */}
      <motion.rect
        x="64" y="110" width="16" height="16" rx="2"
        fill="#87CEEB" stroke="#2C3E50" strokeWidth="1.5"
        variants={appear(2.4)}
      />
      <motion.line x1="72" y1="110" x2="72" y2="126" stroke="#2C3E50" strokeWidth="1" variants={draw(2.6, 0.3)} />
      <motion.line x1="64" y1="118" x2="80" y2="118" stroke="#2C3E50" strokeWidth="1" variants={draw(2.6, 0.3)} />

      {/* Right window */}
      <motion.rect
        x="120" y="110" width="16" height="16" rx="2"
        fill="#87CEEB" stroke="#2C3E50" strokeWidth="1.5"
        variants={appear(2.4)}
      />
      <motion.line x1="128" y1="110" x2="128" y2="126" stroke="#2C3E50" strokeWidth="1" variants={draw(2.6, 0.3)} />
      <motion.line x1="120" y1="118" x2="136" y2="118" stroke="#2C3E50" strokeWidth="1" variants={draw(2.6, 0.3)} />

      {/* Chimney */}
      <motion.rect
        x="125" y="48" width="14" height="30" rx="2"
        fill="#8B4513" stroke="#2C3E50" strokeWidth="1.5"
        variants={rise(2.8, 15)}
      />

      {/* Smoke puffs */}
      {[
        { cx: 132, cy: 38, r: 5, delay: 3.3 },
        { cx: 138, cy: 28, r: 4, delay: 3.5 },
        { cx: 133, cy: 18, r: 3, delay: 3.7 },
      ].map((s, i) => (
        <motion.circle
          key={`smoke-${i}`}
          cx={s.cx} cy={s.cy} r={s.r}
          fill="#2C3E50" fillOpacity="0.15"
          variants={appear(s.delay, 0.6)}
          animate={{ y: [0, -8, -4], opacity: [0, 0.3, 0] }}
          transition={{
            delay: s.delay, duration: 2.5,
            repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut',
          }}
        />
      ))}
    </motion.svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Cycling status messages                                            */
/* ------------------------------------------------------------------ */

const MESSAGES = [
  'Laying the foundation\u2026',
  'Raising the walls\u2026',
  'Fitting the roof\u2026',
  'Adding the details\u2026',
  'Scanning planning records\u2026',
  'Analysing historical data\u2026',
  'Comparing local precedents\u2026',
  'Crunching the numbers\u2026',
  'Preparing your report\u2026',
]

function CyclingMessage() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-6 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          className="absolute text-sm font-medium text-slate-blue/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Elapsed timer                                                      */
/* ------------------------------------------------------------------ */

function ElapsedTimer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <span className="tabular-nums text-xs text-slate-blue/30 font-medium">
      {mins > 0
        ? `${mins}m ${secs.toString().padStart(2, '0')}s`
        : `${secs}s`}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Pulsing progress bar                                               */
/* ------------------------------------------------------------------ */

function ProgressBar() {
  return (
    <div className="w-full max-w-xs mx-auto h-1 rounded-full bg-neutral-200 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blueprint-teal via-copper to-blueprint-teal"
        style={{ backgroundSize: '200% 100%' }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main loader — loops the house animation                            */
/* ------------------------------------------------------------------ */

/** Full cycle duration (build + hold) before the house resets. */
const CYCLE_MS = 6000

export function HouseBuildingLoader() {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Re-mounting with a new key restarts all framer-motion animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HouseSvg />
        </motion.div>
      </AnimatePresence>

      <CyclingMessage />
      <ProgressBar />

      <div className="flex items-center gap-2 mt-1">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-blueprint-teal"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <ElapsedTimer />
      </div>
    </div>
  )
}
