'use client'

import { MapPin } from 'lucide-react'

interface PostcodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function PostcodeInput({ value, onChange, disabled }: PostcodeInputProps) {
  return (
    <div>
      <label htmlFor="postcode" className="block text-sm font-semibold text-slate-blue mb-2">
        Postcode
      </label>
      <div className="field-shell">
        <div className="field-icon">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          id="postcode"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          placeholder="e.g. SW1A 1AA"
          maxLength={10}
          className="field-control uppercase"
          aria-describedby="postcode-hint"
        />
      </div>
      <p id="postcode-hint" className="mt-1.5 text-xs text-slate-blue/30">
        Enter UK postcode
      </p>
    </div>
  )
}
