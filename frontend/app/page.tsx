'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, TrendingUp, Lightbulb, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()

  // Hero shrinks from fullscreen to a rounded card over the first 250px of scroll
  const heroScale = useTransform(scrollY, [0, 250], [1, 0.96])
  const heroBorderRadius = useTransform(scrollY, [0, 250], [0, 24])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative bg-neutral-100">
      {/* ============================================================
          HERO — fullscreen video that shrinks into a card on scroll
          ============================================================ */}
      <section className="relative h-[130vh]">
        <div className="sticky top-0 h-screen">
          <motion.div
            style={{
              scale: heroScale,
              borderRadius: heroBorderRadius,
            }}
            className="relative h-full overflow-hidden origin-center"
          >
            <video
              src="/hero-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                    Predicting Renovation Approvals with{' '}
                    <span className="text-copper drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">Data.</span>
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl text-white max-w-2xl mx-auto font-normal leading-relaxed bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4">
                    Enter your property details to instantly reveal the
                    probability of council approval, backed by thousands of
                    historical planning decisions.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/analyse"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-blue font-medium text-lg shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 active:scale-[0.965]"
                  >
                    Start Analysis
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          TWO CARDS SIDE BY SIDE — bigger left, smaller right
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bigger card — The Data Advantage */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-slate-blue rounded-3xl p-8 sm:p-10 lg:p-12 flex flex-col"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight">
              Every planning decision in the UK.{' '}
              <span className="text-copper">In your pocket.</span>
            </h2>
            <p className="mt-4 text-lg text-white/70 font-normal leading-relaxed">
              We've compiled millions of historical UK planning decisions so you
              can instantly see how your proposal stacks up against real
              precedents.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: '2M+', label: 'Planning Records' },
                { value: '400+', label: 'UK Councils' },
                { value: '94%', label: 'Prediction Accuracy' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/10 px-4 py-5 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-copper">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-white/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Smaller card — Maximise ROI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 bg-copper rounded-3xl p-8 sm:p-10 lg:p-12 flex flex-col"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight">
              Maximise your <span className="text-white/80">ROI</span>
            </h2>
            <p className="mt-4 text-white/70 font-normal leading-relaxed">
              We find extra improvements you can add to extract maximum value
              from your property.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {[
                { icon: TrendingUp, title: 'Value Uplift Estimates', desc: 'See projected value increases for each improvement' },
                { icon: Lightbulb, title: 'Smart Suggestions', desc: 'AI-recommended additions based on similar properties' },
                { icon: ShieldCheck, title: 'Risk Assessment', desc: 'Know your approval odds before you apply' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl bg-white/10 p-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{item.title}</p>
                    <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          POWERED BY — technology marquee
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 overflow-hidden"
        >
          <p className="text-center text-sm font-medium text-neutral-400 uppercase tracking-widest mb-8">
            Powered by
          </p>

          {/* Marquee container */}
          <div className="relative">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent" />

            <div className="flex animate-marquee w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-6 px-3">
                  {[
                    {
                      name: 'ElevenLabs',
                      desc: 'AI Voice Synthesis',
                      color: 'bg-slate-blue',
                      accent: 'text-white',
                    },
                    {
                      name: 'Google Gemini',
                      desc: 'Multimodal AI Analysis',
                      color: 'bg-copper',
                      accent: 'text-white',
                    },
                    {
                      name: 'IBEX API',
                      desc: 'Planning Approval Data',
                      color: 'bg-blueprint-teal',
                      accent: 'text-white',
                    },
                    {
                      name: 'ElevenLabs',
                      desc: 'AI Voice Synthesis',
                      color: 'bg-slate-blue',
                      accent: 'text-white',
                    },
                    {
                      name: 'Google Gemini',
                      desc: 'Multimodal AI Analysis',
                      color: 'bg-copper',
                      accent: 'text-white',
                    },
                    {
                      name: 'IBEX API',
                      desc: 'Planning Approval Data',
                      color: 'bg-blueprint-teal',
                      accent: 'text-white',
                    },
                  ].map((tech, i) => (
                    <div
                      key={i}
                      className={`${tech.color} rounded-2xl px-8 py-6 min-w-[220px] flex flex-col items-center text-center shrink-0 shadow-card`}
                    >
                      <p className={`text-lg font-semibold ${tech.accent}`}>
                        {tech.name}
                      </p>
                      <p className="text-sm text-white/60 mt-1">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          VIDEO CARD — final CTA with background video
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden min-h-[60vh] flex flex-col justify-center"
        >
          <video
            src="/break-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              Ready to unlock your property's potential?
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-white max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
              Find out exactly what you can build and how much value it could
              add to your property today.
            </p>
            <div className="mt-10">
              <Link
                href="/analyse"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-copper text-white font-medium text-lg shadow-[0_0_40px_rgba(200,100,50,0.3)] hover:shadow-[0_0_60px_rgba(200,100,50,0.5)] hover:bg-copper/90 transition-all duration-300 active:scale-[0.965]"
              >
                Evaluate Possibilities
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
