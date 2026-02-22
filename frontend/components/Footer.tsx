export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs text-neutral-500">
          Planning and valuation estimates are indicative only. Data sources
          include Ibex planning applications and Land Registry. See our{' '}
          <a
            href="#"
            className="underline hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
          >
            methodology
          </a>
          ,{' '}
          <a
            href="#"
            className="underline hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
          >
            Ibex disclaimer
          </a>
          , and{' '}
          <a
            href="#"
            className="underline hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
          >
            Land Registry terms
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
