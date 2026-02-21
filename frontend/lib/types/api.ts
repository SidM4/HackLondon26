// API request/response types for Renovation Optimiser

export type ProposalType =
  | 'loft_dormer'
  | 'rear_extension'
  | 'garage_conversion'
  | 'hmo'
  | 'change_of_use'

export interface Proposal {
  type: ProposalType
  added_sqm: number
  bedrooms_added?: number
}

export interface PropertyDescription {
  property_type: string // apartment/villa/house/etc
  bedrooms: number
  bathrooms: number
  other_details?: string
}

export interface AnalyseRequest {
  postcode: string
  property_description: PropertyDescription
  work_type: string
}

export interface SuggestedImprovement {
  work_type: string
  work_type_label: string
  estimated_cost: number
  value_added: number
  approval_probability: number
  description: string
}

export interface AnalyseResponse {
  approval_probability: number
  confidence: number
  precedents: Precedent[]
  suggested_improvements: SuggestedImprovement[]
  location_insights?: string
}

export interface PredictPlanningRequest {
  address: string
  lat: number
  lon: number
  proposal: Proposal
  radius_m: number
}

export interface TopFeature {
  feature: string
  value: number
}

export interface Precedent {
  app_id: string
  decision: 'approved' | 'refused'
  date: string
  title: string
  url?: string
  lat?: number
  lon?: number
}

export interface PredictPlanningResponse {
  probability: number
  confidence: number
  top_features: TopFeature[]
  precedents: Precedent[]
}

export interface EstimateROIRequest {
  address: string
  proposal: Proposal & { bedrooms_added?: number }
  V0: number
  C_plan: number
  C_build: number
  p: number | null
}

export interface EstimateROIResponse {
  p: number
  V1: number
  V1_sigma: number
  EV: number
  percentiles: { p10: number; p50: number; p90: number }
  recommendation: string
  explanation: string
  precedents: Precedent[]
}

// Legacy types kept for backward compatibility
