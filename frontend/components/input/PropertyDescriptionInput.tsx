'use client'

import type { PropertyDescription } from '@/lib/types/api'
import { PropertyDescriptionTextarea } from './PropertyDescriptionTextarea'
import { PropertyDetailsFields } from './PropertyDetailsFields'

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
      <PropertyDescriptionTextarea value={value} onChange={onChange} disabled={disabled} />
      <PropertyDetailsFields value={value} onChange={onChange} disabled={disabled} />
    </div>
  )
}
