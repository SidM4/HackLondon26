'use client'

interface PostcodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function PostcodeInput({
  value,
  onChange,
  disabled,
}: PostcodeInputProps) {
  return (
    <div>
      <label htmlFor="postcode" className="block text-sm font-medium text-neutral-700 mb-2">
        Postcode
      </label>
      <input
        id="postcode"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        disabled={disabled}
        placeholder="e.g. SW1A 1AA"
        maxLength={10}
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:bg-neutral-100 uppercase"
        aria-describedby="postcode-hint"
      />
      <p id="postcode-hint" className="mt-1 text-xs text-neutral-500">
        Enter UK postcode (e.g. SW1A 1AA)
      </p>
    </div>
  )
}
