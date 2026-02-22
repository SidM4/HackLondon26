'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Analyse', href: '#analyse' },
]

export function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav
        className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full bg-white/90 backdrop-blur-md px-2 pl-6 shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-semibold text-slate-blue text-lg tracking-tight"
        >
          MERIDIAN
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-blue/60 hover:text-slate-blue transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#analyse"
          className="group flex items-center gap-2 rounded-full bg-slate-blue px-5 py-2 text-sm font-medium text-white hover:bg-slate-blue/90 transition-all duration-300 active:scale-[0.965]"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </nav>
    </motion.header>
  )
}
