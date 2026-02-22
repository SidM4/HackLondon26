'use client'

import { create } from 'zustand'
import type {
  PredictPlanningResponse,
  EstimateROIResponse,
  AnalyseResponse,
  Precedent,
  PropertyDescription,
} from '@/lib/types/api'

export interface AnalysisInputs {
  postcode: string
  property_description: PropertyDescription
  work_type: string
}

interface AnalysisState {
  inputs: AnalysisInputs | null
  analyseResult: AnalyseResponse | null
  planning: PredictPlanningResponse | null
  roi: EstimateROIResponse | null
  loading: boolean
  error: string | null
  selectedPrecedent: Precedent | null
  setInputs: (v: AnalysisInputs | null) => void
  setAnalyseResult: (v: AnalyseResponse | null) => void
  setPlanning: (v: PredictPlanningResponse | null) => void
  setRoi: (v: EstimateROIResponse | null) => void
  setLoading: (v: boolean) => void
  setError: (v: string | null) => void
  setSelectedPrecedent: (v: Precedent | null) => void
  reset: () => void
}

export const defaultInputs: AnalysisInputs = {
  postcode: '',
  property_description: {
    property_type: '',
    bedrooms: 0,
    bathrooms: 0,
    other_details: '',
  },
  work_type: '',
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  inputs: null,
  analyseResult: null,
  planning: null,
  roi: null,
  loading: false,
  error: null,
  selectedPrecedent: null,
  setInputs: (inputs) => set({ inputs }),
  setAnalyseResult: (analyseResult) => set({ analyseResult }),
  setPlanning: (planning) => set({ planning }),
  setRoi: (roi) => set({ roi }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedPrecedent: (selectedPrecedent) => set({ selectedPrecedent }),
  reset: () =>
    set({
      inputs: null,
      analyseResult: null,
      planning: null,
      roi: null,
      error: null,
      selectedPrecedent: null,
    }),
}))
