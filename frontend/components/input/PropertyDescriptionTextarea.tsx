'use client'

import type { PropertyDescription } from '@/lib/types/api'

interface PropertyDescriptionTextareaProps {
  value: PropertyDescription
  onChange: (value: PropertyDescription) => void
  disabled?: boolean
}

export function PropertyDescriptionTextarea({
  value,
  onChange,
  disabled,
}: PropertyDescriptionTextareaProps) {
  return (
    <div>
      <label
        htmlFor="property-description"
        className="block text-sm font-semibold text-slate-blue mb-2"
      >
        Description
      </label>
      <textarea
        id="property-description"
        value={value.other_details || ''}
        onChange={(e) => onChange({ ...value, other_details: e.target.value })}
        disabled={disabled}
        rows={3}
        placeholder="Describe your property (e.g. Victorian terraced house with garden and off-street parking...)"
        className="input-field resize-y min-h-[88px]"
      />
    </div>
  )
}
