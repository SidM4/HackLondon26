import axios from 'axios'
import type {
  PredictPlanningRequest,
  PredictPlanningResponse,
  EstimateROIRequest,
  EstimateROIResponse,
  AnalyseRequest,
  AnalyseResponse,
} from '../types/api'
import {
  mockPredictPlanningResponse,
  mockEstimateROIResponse,
  mockAnalyseResponse,
} from '../mock/fixtures'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  (process.env.NODE_ENV === 'development' && !BASE_URL)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000,
  headers: { 'Content-Type': 'application/json' },
})

export async function predictPlanning(
  body: PredictPlanningRequest
): Promise<PredictPlanningResponse> {
  if (USE_MOCK) {
    await delay(800)
    return { ...mockPredictPlanningResponse }
  }
  const { data } = await api.post<PredictPlanningResponse>(
    '/predict_planning',
    body
  )
  return data
}

export async function estimateROI(
  body: EstimateROIRequest
): Promise<EstimateROIResponse> {
  if (USE_MOCK) {
    await delay(600)
    return { ...mockEstimateROIResponse }
  }
  const { data } = await api.post<EstimateROIResponse>('/estimate_roi', body)
  return data
}

export async function analyse(
  body: AnalyseRequest
): Promise<AnalyseResponse> {
  if (USE_MOCK) {
    await delay(1000)
    return { ...mockAnalyseResponse }
  }
  try {
    const { data } = await api.post<AnalyseResponse>('/analyse', body)
    return data
  } catch (err) {
    // Extract the server's error message from the response body
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error)
    }
    throw err
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
