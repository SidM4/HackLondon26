'use client'

import type { PropertyDescription } from '@/lib/types/api'

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
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Property description
        </label>
        <textarea
          value={value.other_details || ''}
          onChange={(e) =>
            onChange({ ...value, other_details: e.target.value })
          }
          disabled={disabled}
          rows={4}
          placeholder="Describe your property (e.g. Victorian terraced house, 3 bedrooms, 1 bathroom, garden, off-street parking…)"
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:bg-neutral-100 resize-y min-h-[100px]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="property-type" className="block text-sm font-medium text-neutral-700 mb-2">
            Property type
          </label>
          <input
            id="property-type"
            type="text"
            value={value.property_type}
            onChange={(e) =>
              onChange({ ...value, property_type: e.target.value })
            }
            disabled={disabled}
            placeholder="e.g. Apartment, Villa, House"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-2">
            Bedrooms
          </label>
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
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-neutral-700 mb-2">
            Bathrooms
          </label>
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
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          />
        </div>
      </div>
    </div>
  )
}
