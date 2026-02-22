'use client'

import { useMemo, useState } from 'react'

type TestStatus = 'idle' | 'running' | 'passed' | 'failed'

interface ConnectionDiagnostics {
  ok: boolean
  checkedAt: string
  gemini: {
    ok: boolean
    latencyMs: number
    modelCount?: number
    sampleModels?: string[]
    error?: string
  }
  ibex: {
    ok: boolean
    latencyMs: number
    sampleApplicationCount?: number
    error?: string
  }
}

interface TestResult {
  status: TestStatus
  startedAt?: number
  endedAt?: number
  output?: ConnectionDiagnostics
  error?: string
}

function formatDurationMs(result: TestResult): string {
  if (!result.startedAt || !result.endedAt) return '-'
  return `${result.endedAt - result.startedAt} ms`
}

function pretty(value: unknown): string {
  if (value == null) return ''
  return JSON.stringify(value, null, 2)
}

function statusClass(status: TestStatus): string {
  if (status === 'passed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'failed') return 'bg-red-100 text-red-700'
  if (status === 'running') return 'bg-amber-100 text-amber-700'
  return 'bg-neutral-200 text-neutral-700'
}

export default function TestPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '(same origin)'
  const useMock = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
      (process.env.NODE_ENV === 'development' &&
        !process.env.NEXT_PUBLIC_API_BASE_URL)
    )
  }, [])

  const [result, setResult] = useState<TestResult>({ status: 'idle' })

  async function runConnectionDiagnostics() {
    const startedAt = Date.now()
    setResult({ status: 'running', startedAt })
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const response = await fetch(`${base}/diagnostics/connections`, {
        cache: 'no-store',
      })
      const json = (await response.json()) as ConnectionDiagnostics

      if (!response.ok) {
        throw new Error(pretty(json))
      }

      setResult({
        status: json.ok ? 'passed' : 'failed',
        startedAt,
        endedAt: Date.now(),
        output: json,
        error: json.ok ? undefined : 'One or more provider checks failed',
      })
    } catch (err) {
      setResult({
        status: 'failed',
        startedAt,
        endedAt: Date.now(),
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 pt-28 pb-14">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-blue">
            Provider Diagnostics
          </h1>
          <p className="mt-3 text-sm text-slate-blue/70">
            Lightweight checks for Gemini and Ibex only. This does not run the
            full analysis pipeline and avoids large Ibex fetches.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <p className="rounded-xl bg-neutral-100 px-4 py-2 text-sm text-slate-blue/80">
              API base URL: <span className="font-semibold">{apiBaseUrl}</span>
            </p>
            <p className="rounded-xl bg-neutral-100 px-4 py-2 text-sm text-slate-blue/80">
              Mock mode: <span className="font-semibold">{useMock ? 'ON' : 'OFF'}</span>
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={runConnectionDiagnostics}
              className="rounded-xl bg-slate-blue px-4 py-2 text-sm font-semibold text-white hover:bg-slate-blue/90"
            >
              Run Gemini + Ibex Diagnostics
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-blue">
              Connection Check Result
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(
                result.status
              )}`}
            >
              {result.status}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-blue/60">
            Duration: {formatDurationMs(result)}
          </p>

          {result.output ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ProviderCard
                name="Gemini"
                ok={result.output.gemini.ok}
                latencyMs={result.output.gemini.latencyMs}
                details={
                  result.output.gemini.ok
                    ? `models: ${result.output.gemini.modelCount ?? 0}`
                    : result.output.gemini.error ?? 'Unknown error'
                }
              />
              <ProviderCard
                name="Ibex"
                ok={result.output.ibex.ok}
                latencyMs={result.output.ibex.latencyMs}
                details={
                  result.output.ibex.ok
                    ? `sample applications: ${
                        result.output.ibex.sampleApplicationCount ?? 0
                      }`
                    : result.output.ibex.error ?? 'Unknown error'
                }
              />
            </div>
          ) : null}

          {result.error ? (
            <pre className="mt-4 rounded-xl bg-red-50 p-4 text-xs text-red-700 overflow-auto whitespace-pre-wrap">
              {result.error}
            </pre>
          ) : null}

          {result.output ? (
            <pre className="mt-4 rounded-xl bg-neutral-100 p-4 text-xs text-slate-blue overflow-auto max-h-80">
              {pretty(result.output)}
            </pre>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function ProviderCard({
  name,
  ok,
  latencyMs,
  details,
}: {
  name: string
  ok: boolean
  latencyMs: number
  details: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-slate-blue">{name}</p>
      <p className={`mt-1 text-xs ${ok ? 'text-emerald-700' : 'text-red-700'}`}>
        {ok ? 'Connected' : 'Failed'}
      </p>
      <p className="mt-1 text-xs text-slate-blue/70">Latency: {latencyMs} ms</p>
      <p className="mt-1 text-xs text-slate-blue/70">{details}</p>
    </div>
  )
}
