'use client'

import type { PropertyDescription } from '@/lib/types/api'
import { Home, BedDouble, Bath } from 'lucide-react'

interface PropertyDescriptionInputProps {
  value: PropertyDescription
  onChange: (value: PropertyDescription) => void
  disabled?: boolean
}

export function PropertyDescriptionInput({
  value,
  onChange,
  disabled,
}: PropertyDescriptionInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-blue mb-2">
          Property description
        </label>
        <textarea
          value={value.other_details || ''}
          onChange={(e) =>
            onChange({ ...value, other_details: e.target.value })
          }
          disabled={disabled}
          rows={3}
          placeholder="Describe your property (e.g. Victorian terraced house with garden and off-street parking...)"
          className="input-field resize-y min-h-[88px]"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="property-type" className="block text-sm font-semibold text-slate-blue mb-2">
            Property type
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-blue/30">
              <Home className="h-4 w-4" />
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
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-semibold text-slate-blue mb-2">
            Bedrooms
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-blue/30">
              <BedDouble className="h-4 w-4" />
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
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-semibold text-slate-blue mb-2">
            Bathrooms
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-blue/30">
              <Bath className="h-4 w-4" />
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
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
