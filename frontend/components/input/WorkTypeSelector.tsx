'use client'

import { WORK_TYPES_BY_CATEGORY } from '@/lib/constants/workTypes'
import { Wrench } from 'lucide-react'

interface WorkTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function WorkTypeSelector({ value, onChange, disabled }: WorkTypeSelectorProps) {
  return (
    <div>
      <label htmlFor="work-type" className="block text-sm font-semibold text-slate-blue mb-2">
        Type of work
      </label>
      <div className="field-shell relative pr-12">
        <div className="field-icon">
          <Wrench className="h-4 w-4" />
        </div>
        <select
          id="work-type"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="field-control appearance-none cursor-pointer text-base sm:text-base"
          aria-describedby="work-type-hint"
        >
          <option value="">Select type of work...</option>
          {Object.entries(WORK_TYPES_BY_CATEGORY).map(([category, types]) => (
            <optgroup key={category} label={category}>
              {types.map((wt) => (
                <option key={wt.id} value={wt.id}>
                  {wt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-blue/30">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <p id="work-type-hint" className="mt-1.5 text-xs text-slate-blue/30">
        Select the renovation type requiring council approval
      </p>
    </div>
  )
}
