'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top section - CTA + links */}
        <div className="py-16 sm:py-20 grid gap-12 lg:grid-cols-12">
          {/* Brand + CTA */}
          <div className="lg:col-span-5">
            <Link href="/" className="heading-display text-2xl text-slate-blue">
              MERIDIAN
            </Link>
            <p className="mt-4 text-base text-slate-blue/40 leading-relaxed max-w-sm">
              AI-powered planning approval predictions backed by thousands
              of historical council decisions and Land Registry data.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="#analyse"
                className="group inline-flex items-center gap-2 rounded-lg bg-slate-blue px-6 py-3 text-sm font-semibold text-white hover:bg-slate-blue/90 transition-all duration-300 active:scale-[0.965]"
              >
                Start Analysis
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="mailto:hello@meridian.ai"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-neutral-200 px-6 py-3 text-sm font-semibold text-slate-blue hover:border-slate-blue/20 transition-all duration-300"
              >
                Speak to Our Team
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-blue/30 mb-5">
                Resources
              </h3>
              <ul className="space-y-3">
                {['Methodology', 'API Documentation', 'Case Studies'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-blue/50 hover:text-slate-blue transition-colors duration-200 link-underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-blue/30 mb-5">
                Legal
              </h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Ibex Disclaimer', 'Land Registry'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-blue/50 hover:text-slate-blue transition-colors duration-200 link-underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-blue/30 mb-5">
                Connect
              </h3>
              <ul className="space-y-3">
                {['LinkedIn', 'X (Twitter)', 'About', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-blue/50 hover:text-slate-blue transition-colors duration-200 link-underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-blue/25">
            Planning and valuation estimates are indicative only. Data sources include Ibex planning applications and Land Registry.
          </p>
          <p className="text-xs text-slate-blue/25">
            &copy; {new Date().getFullYear()} Meridian
          </p>
        </div>
      </div>
    </footer>
  )
}
