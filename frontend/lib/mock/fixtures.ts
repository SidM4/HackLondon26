import type {
  PredictPlanningResponse,
  EstimateROIResponse,
  Precedent,
  AnalyseResponse,
  SuggestedImprovement,
} from '../types/api'

const mockPrecedents: Precedent[] = [
  {
    app_id: 'APP-1234',
    decision: 'approved',
    date: '2024-11-01',
    title: 'Loft dormer, 14 Oak Road',
    url: 'https://example.com/app/APP-1234',
    lat: 51.508,
    lon: -0.128,
  },
  {
    app_id: 'APP-2345',
    decision: 'approved',
    date: '2024-10-15',
    title: 'Loft conversion with rear dormer, 22 Elm Street',
    url: 'https://example.com/app/APP-2345',
    lat: 51.509,
    lon: -0.127,
  },
  {
    app_id: 'APP-3456',
    decision: 'refused',
    date: '2024-09-20',
    title: 'Loft dormer, 8 Maple Close',
    url: 'https://example.com/app/APP-3456',
    lat: 51.507,
    lon: -0.129,
  },
  {
    app_id: 'APP-4567',
    decision: 'approved',
    date: '2024-08-10',
    title: 'Rear dormer and loft conversion, 5 Cedar Lane',
    url: 'https://example.com/app/APP-4567',
    lat: 51.51,
    lon: -0.126,
  },
  {
    app_id: 'APP-5678',
    decision: 'approved',
    date: '2024-07-22',
    title: 'Garage conversion, 12 Pine Avenue',
    url: 'https://example.com/app/APP-5678',
    lat: 51.5085,
    lon: -0.1275,
  },
  {
    app_id: 'APP-6789',
    decision: 'approved',
    date: '2024-06-15',
    title: 'Conservatory addition, 7 Birch Way',
    url: 'https://example.com/app/APP-6789',
    lat: 51.5095,
    lon: -0.1285,
  },
]

export const mockPredictPlanningResponse: PredictPlanningResponse = {
  probability: 0.67,
  confidence: 0.05,
  top_features: [
    { feature: 'approval_rate_loft_250m', value: 0.71 },
    { feature: 'in_conservation_area', value: 0 },
    { feature: 'avg_neighbour_objections', value: 0.3 },
  ],
  precedents: mockPrecedents,
}

export const mockEstimateROIResponse: EstimateROIResponse = {
  p: 0.67,
  V1: 470000,
  V1_sigma: 8000,
  EV: 23450,
  percentiles: { p10: -12000, p50: 23450, p90: 68000 },
  recommendation: 'Proceed — medium risk',
  explanation:
    '67% approval probability. If approved the property typically revalues to £470k; expected profit after build & planning costs is ~£23.5k.',
  precedents: mockPrecedents,
}

const mockSuggestedImprovements: SuggestedImprovement[] = [
  {
    work_type: 'loft_conversion',
    work_type_label: 'Loft conversion',
    estimated_cost: 45000,
    value_added: 65000,
    approval_probability: 0.72,
    description: 'Convert loft space into bedroom with en-suite. High approval rate in this area.',
  },
  {
    work_type: 'rear_extension',
    work_type_label: 'Rear extension',
    estimated_cost: 38000,
    value_added: 55000,
    approval_probability: 0.68,
    description: 'Single-storey rear extension to create open-plan kitchen-diner.',
  },
  {
    work_type: 'garage_conversion',
    work_type_label: 'Garage conversion',
    estimated_cost: 18000,
    value_added: 28000,
    approval_probability: 0.85,
    description: 'Convert existing garage into habitable room. Often permitted development.',
  },
  {
    work_type: 'conservatory',
    work_type_label: 'Conservatory',
    estimated_cost: 22000,
    value_added: 32000,
    approval_probability: 0.78,
    description: 'Glass conservatory extension. Popular in this postcode area.',
  },
  {
    work_type: 'external_facade',
    work_type_label: 'External facade work',
    estimated_cost: 15000,
    value_added: 20000,
    approval_probability: 0.65,
    description: 'Update external appearance with new cladding or rendering.',
  },
]

export const mockAnalyseResponse: AnalyseResponse = {
  approval_probability: 0.71,
  confidence: 0.06,
  precedents: mockPrecedents,
  suggested_improvements: mockSuggestedImprovements,
  location_insights:
    'This postcode shows high approval rates for loft conversions and extensions. Properties in this area typically see good ROI on home improvements.',
}
