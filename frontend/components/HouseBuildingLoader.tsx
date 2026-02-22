'use client'

import { motion } from 'framer-motion'

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

const MESSAGES = [
  'Laying the foundation…',
  'Raising the walls…',
  'Fitting the roof…',
  'Adding the details…',
  'Analysing historical data…',
]

export function HouseBuildingLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        initial="hidden"
        animate="visible"
        className="overflow-visible"
      >
        {/* ── Ground line ── */}
        <motion.line
          x1="20"
          y1="170"
          x2="180"
          y2="170"
          stroke="#2C3E50"
          strokeWidth="3"
          strokeLinecap="round"
          variants={draw(0, 0.5)}
        />

        {/* ── Foundation ── */}
        <motion.rect
          x="45"
          y="158"
          width="110"
          height="12"
          rx="2"
          fill="#2C3E50"
          variants={rise(0.4, 20)}
        />

        {/* ── Left wall ── */}
        <motion.rect
          x="50"
          y="95"
          width="8"
          height="63"
          fill="#2C3E50"
          variants={rise(0.8, 30)}
        />

        {/* ── Right wall ── */}
        <motion.rect
          x="142"
          y="95"
          width="8"
          height="63"
          fill="#2C3E50"
          variants={rise(0.8, 30)}
        />

        {/* ── Wall fill (brick body) ── */}
        <motion.rect
          x="58"
          y="100"
          width="84"
          height="58"
          fill="#E8D5C4"
          variants={rise(1.0, 20, 0.7)}
        />

        {/* ── Brick lines (horizontal) ── */}
        {[115, 130, 145].map((y, i) => (
          <motion.line
            key={`brick-h-${i}`}
            x1="58"
            y1={y}
            x2="142"
            y2={y}
            stroke="#2C3E50"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            variants={draw(1.2 + i * 0.1, 0.3)}
          />
        ))}

        {/* ── Roof (triangle) ── */}
        <motion.path
          d="M 35 98 L 100 45 L 165 98 Z"
          fill="#D35400"
          variants={rise(1.6, -30, 0.7)}
        />

        {/* ── Roof outline ── */}
        <motion.path
          d="M 35 98 L 100 45 L 165 98"
          stroke="#2C3E50"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={draw(1.8, 0.6)}
        />

        {/* ── Door ── */}
        <motion.rect
          x="87"
          y="126"
          width="26"
          height="32"
          rx="3"
          fill="#2C3E50"
          variants={appear(2.2)}
        />
        {/* Door knob */}
        <motion.circle
          cx="108"
          cy="144"
          r="2"
          fill="#D35400"
          variants={appear(2.5)}
        />

        {/* ── Left window ── */}
        <motion.rect
          x="64"
          y="110"
          width="16"
          height="16"
          rx="2"
          fill="#87CEEB"
          stroke="#2C3E50"
          strokeWidth="1.5"
          variants={appear(2.4)}
        />
        {/* Window cross */}
        <motion.line
          x1="72"
          y1="110"
          x2="72"
          y2="126"
          stroke="#2C3E50"
          strokeWidth="1"
          variants={draw(2.6, 0.3)}
        />
        <motion.line
          x1="64"
          y1="118"
          x2="80"
          y2="118"
          stroke="#2C3E50"
          strokeWidth="1"
          variants={draw(2.6, 0.3)}
        />

        {/* ── Right window ── */}
        <motion.rect
          x="120"
          y="110"
          width="16"
          height="16"
          rx="2"
          fill="#87CEEB"
          stroke="#2C3E50"
          strokeWidth="1.5"
          variants={appear(2.4)}
        />
        {/* Window cross */}
        <motion.line
          x1="128"
          y1="110"
          x2="128"
          y2="126"
          stroke="#2C3E50"
          strokeWidth="1"
          variants={draw(2.6, 0.3)}
        />
        <motion.line
          x1="120"
          y1="118"
          x2="136"
          y2="118"
          stroke="#2C3E50"
          strokeWidth="1"
          variants={draw(2.6, 0.3)}
        />

        {/* ── Chimney ── */}
        <motion.rect
          x="125"
          y="48"
          width="14"
          height="30"
          rx="2"
          fill="#8B4513"
          stroke="#2C3E50"
          strokeWidth="1.5"
          variants={rise(2.8, 15)}
        />

        {/* ── Smoke puffs ── */}
        {[
          { cx: 132, cy: 38, r: 5, delay: 3.3 },
          { cx: 138, cy: 28, r: 4, delay: 3.5 },
          { cx: 133, cy: 18, r: 3, delay: 3.7 },
        ].map((s, i) => (
          <motion.circle
            key={`smoke-${i}`}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#2C3E50"
            fillOpacity="0.15"
            variants={appear(s.delay, 0.6)}
            animate={{
              y: [0, -8, -4],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              delay: s.delay,
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.svg>

      {/* ── Progress messages ── */}
      <div className="h-6 flex items-center justify-center">
        {MESSAGES.map((msg, i) => (
          <motion.span
            key={msg}
            className="absolute text-sm font-medium text-slate-blue/70"
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [8, 0, 0, -8],
            }}
            transition={{
              delay: i * 0.8,
              duration: 0.8 * 1.2,
              times: [0, 0.2, 0.8, 1],
              ease: 'easeInOut',
            }}
          >
            {msg}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
