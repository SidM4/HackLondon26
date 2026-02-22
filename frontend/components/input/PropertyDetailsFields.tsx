'use client'

import type { PropertyDescription } from '@/lib/types/api'
import { Home, BedDouble, Bath } from 'lucide-react'

interface PropertyDetailsFieldsProps {
  value: PropertyDescription
  onChange: (value: PropertyDescription) => void
  disabled?: boolean
}

export function PropertyDetailsFields({
  value,
  onChange,
  disabled,
}: PropertyDetailsFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      <div>
        <label
          htmlFor="property-type"
          className="block text-sm font-semibold text-slate-blue mb-2"
        >
          Property type
        </label>
        <div className="field-shell-compact">
          <div className="field-icon-compact">
            <Home className="h-3.5 w-3.5" />
          </div>
          <input
            id="property-type"
            type="text"
            value={value.property_type}
            onChange={(e) =>
              onChange({ ...value, property_type: e.target.value })
            }
            disabled={disabled}
            placeholder="e.g. House"
            className="field-control-compact"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bedrooms"
          className="block text-sm font-semibold text-slate-blue mb-2"
        >
          Bedrooms
        </label>
        <div className="field-shell-compact">
          <div className="field-icon-compact">
            <BedDouble className="h-3.5 w-3.5" />
          </div>
          <input
            id="bedrooms"
            type="number"
            min={0}
            max={20}
            value={value.bedrooms || ''}
            onChange={(e) =>
              onChange({
                ...value,
                bedrooms: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            disabled={disabled}
            className="field-control-compact"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bathrooms"
          className="block text-sm font-semibold text-slate-blue mb-2"
        >
          Bathrooms
        </label>
        <div className="field-shell-compact">
          <div className="field-icon-compact">
            <Bath className="h-3.5 w-3.5" />
          </div>
          <input
            id="bathrooms"
            type="number"
            min={0}
            max={20}
            value={value.bathrooms || ''}
            onChange={(e) =>
              onChange({
                ...value,
                bathrooms: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            disabled={disabled}
            className="field-control-compact"
          />
        </div>
      </div>
    </div>
  )
}
