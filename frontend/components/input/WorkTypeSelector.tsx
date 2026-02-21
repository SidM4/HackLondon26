'use client'

import { WORK_TYPES_BY_CATEGORY } from '@/lib/constants/workTypes'

interface WorkTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function WorkTypeSelector({
  value,
  onChange,
  disabled,
}: WorkTypeSelectorProps) {
  return (
    <div>
      <label htmlFor="work-type" className="block text-sm font-medium text-neutral-700 mb-2">
        Type of work
      </label>
      <select
        id="work-type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:bg-neutral-100"
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
      <p id="work-type-hint" className="mt-1 text-xs text-neutral-500">
        Select the type of work that requires council approval
      </p>
    </div>
  )
}
