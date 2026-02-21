'use client'

import Link from 'next/link'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded"
        >
          <span className="text-lg font-semibold tracking-tight">
            Renovation Optimiser
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            aria-label="Sign in"
          >
            Sign in
          </button>
          <button
            type="button"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
            aria-label="Download demo report"
          >
            Demo report
          </button>
        </div>
      </nav>
    </header>
  )
}
