export interface WorkType {
  id: string
  label: string
  category: string
}

export const WORK_TYPES: WorkType[] = [
  // Extensions & Conversions
  { id: 'loft_conversion', label: 'Loft conversion', category: 'Extensions & Conversions' },
  { id: 'loft_dormer', label: 'Loft dormer', category: 'Extensions & Conversions' },
  { id: 'rear_extension', label: 'Rear extension', category: 'Extensions & Conversions' },
  { id: 'side_extension', label: 'Side extension', category: 'Extensions & Conversions' },
  { id: 'garage_conversion', label: 'Garage conversion', category: 'Extensions & Conversions' },
  { id: 'basement_conversion', label: 'Basement conversion', category: 'Extensions & Conversions' },
  { id: 'conservatory', label: 'Conservatory', category: 'Extensions & Conversions' },
  { id: 'orangerie', label: 'Orangerie', category: 'Extensions & Conversions' },
  
  // External Works
  { id: 'external_facade', label: 'External facade work', category: 'External Works' },
  { id: 'cladding', label: 'Cladding replacement', category: 'External Works' },
  { id: 'roof_replacement', label: 'Roof replacement', category: 'External Works' },
  { id: 'roof_alteration', label: 'Roof alteration', category: 'External Works' },
  { id: 'windows_replacement', label: 'Windows replacement', category: 'External Works' },
  { id: 'doors_replacement', label: 'Doors replacement', category: 'External Works' },
  { id: 'rendering', label: 'Rendering', category: 'External Works' },
  { id: 'porch', label: 'Porch addition', category: 'External Works' },
  
  // Outbuildings & Structures
  { id: 'outbuilding', label: 'Outbuilding / garden room', category: 'Outbuildings & Structures' },
  { id: 'shed', label: 'Garden shed', category: 'Outbuildings & Structures' },
  { id: 'garage_new', label: 'New garage', category: 'Outbuildings & Structures' },
  { id: 'carport', label: 'Carport', category: 'Outbuildings & Structures' },
  { id: 'fence_wall', label: 'Fence or wall', category: 'Outbuildings & Structures' },
  { id: 'decking', label: 'Decking', category: 'Outbuildings & Structures' },
  
  // Change of Use
  { id: 'hmo', label: 'HMO (House in multiple occupation)', category: 'Change of Use' },
  { id: 'commercial_residential', label: 'Commercial to residential', category: 'Change of Use' },
  { id: 'residential_commercial', label: 'Residential to commercial', category: 'Change of Use' },
  { id: 'annex', label: 'Annex / granny flat', category: 'Change of Use' },
  
  // Other
  { id: 'parking', label: 'Parking space / driveway', category: 'Other' },
  { id: 'solar_panels', label: 'Solar panels', category: 'Other' },
  { id: 'air_conditioning', label: 'Air conditioning unit', category: 'Other' },
  { id: 'satellite_dish', label: 'Satellite dish', category: 'Other' },
  { id: 'demolition', label: 'Demolition', category: 'Other' },
]

export const WORK_TYPES_BY_CATEGORY = WORK_TYPES.reduce((acc, wt) => {
  if (!acc[wt.category]) acc[wt.category] = []
  acc[wt.category].push(wt)
  return acc
}, {} as Record<string, WorkType[]>)
