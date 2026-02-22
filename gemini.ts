/**
 * Gemini query interface with Ibex Planning API integration.
 * - query(): Simple prompt → response (no Ibex)
 * - queryWithIbex(): Baseline Ibex fetch + function-calling loop
 * - analyzeProperty(): Structured property analysis pipeline
 */

import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  Type,
} from "@google/genai";
import type { Content, Part } from "@google/genai";
import { GEMINI_API_KEY as SECRET_API_KEY } from "./secrets";
import { fetchBaseline } from "./ibex";
import { ibexTools, dispatchIbexCall } from "./tools";
// ---------- Pipeline types ----------

export interface PipelineInput {
  postcode: string;
  propertyDescription: string;
  propertyType:
    | "detached"
    | "semi-detached"
    | "terraced"
    | "flat"
    | "bungalow"
    | "other";
  bedrooms: number;
  bathrooms: number;
  plannedWork: string;
}

export interface PipelineReport {
  approvalLikelihood: {
    percentage: number;
    confidence: "low" | "medium" | "high";
    reasoning: string;
  };
  nearbyExamples: Array<{
    address: string;
    description: string;
    decision: string;
    decisionDate: string;
    relevance: string;
  }>;
  suggestedImprovements: Array<{
    improvementType: string;
    approvalRate: string;
    description: string;
    reasoning: string;
  }>;
  costAndROI: Array<{
    improvementType: string;
    estimatedCostGBP: { low: number; high: number };
    estimatedValueAddGBP: { low: number; high: number };
    roiPercentage: number;
    notes: string;
  }>;
  metadata: {
    postcode: string;
    council: string;
    searchRadiusMetres: number;
    applicationsAnalyzed: number;
    generatedAt: string;
  };
}

export interface GatheredData {
  postcodeInfo: { latitude: number; longitude: number; admin_district: string; region: string };
  nearbyApplications: Record<string, unknown>;
  ibexError?: string;
}

function getApiKey(): string {
  if (SECRET_API_KEY) {
    return SECRET_API_KEY;
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Set GEMINI_API_KEY in secrets.ts or GEMINI_API_KEY / GOOGLE_API_KEY in the environment"
    );
  }
  return apiKey;
}

// ---------- Simple query (no Ibex) ----------

export async function query(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  return (response.text ?? "").trim();
}

// ---------- Ibex-integrated query ----------

export interface QueryOptions {
  /** Longitude (WGS84). If provided with lat, baseline Ibex data is fetched. */
  lng?: number;
  /** Latitude (WGS84). */
  lat?: number;
  /** Baseline search radius in metres. Default 500. */
  radius?: number;
  /** Max function-call round trips. Default 5. */
  maxToolRounds?: number;
}

export async function queryWithIbex(
  prompt: string,
  opts: QueryOptions = {}
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const maxRounds = opts.maxToolRounds ?? 5;

  // Step 1: Build system instruction with baseline Ibex data
  let systemText =
    "You are a UK planning applications assistant with access to the Ibex Planning API. " +
    "Use the provided planning data to answer questions about developments, approvals, " +
    "and statistics. If you need more specific data, call the available Ibex functions.";

  if (opts.lng !== undefined && opts.lat !== undefined) {
    try {
      const baseline = await fetchBaseline(
        opts.lng,
        opts.lat,
        opts.radius ?? 500
      );
      systemText +=
        "\n\n--- BASELINE PLANNING DATA (nearby applications) ---\n" +
        baseline +
        "\n--- END BASELINE DATA ---";
    } catch (err) {
      systemText +=
        "\n\n[Baseline Ibex fetch failed: " + (err as Error).message + "]";
    }
  }

  // Step 2: First Gemini call with tools declared
  const contents: Content[] = [
    { role: "user", parts: [{ text: prompt }] },
  ];

  const config = {
    systemInstruction: systemText,
    tools: [{ functionDeclarations: ibexTools }],
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
    },
  };

  let response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents,
    config,
  });

  // Step 3: Function-calling loop
  let rounds = 0;
  while (
    response.functionCalls &&
    response.functionCalls.length > 0 &&
    rounds < maxRounds
  ) {
    rounds++;

    // Append model's full response (preserves thoughtSignature on parts)
    const modelParts = response.candidates?.[0]?.content?.parts;
    if (modelParts) {
      contents.push({ role: "model", parts: modelParts });
    }

    // Execute each function call
    const functionResponseParts: Part[] = [];
    for (const fc of response.functionCalls) {
      const result = await dispatchIbexCall(fc);
      functionResponseParts.push({
        functionResponse: {
          name: fc.name!,
          response: result,
        },
      });
    }

    // Append function results
    contents.push({
      role: "user",
      parts: functionResponseParts,
    });

    // Re-query Gemini with updated conversation
    response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents,
      config,
    });
  }

  return (response.text ?? "").trim();
}

// ---------- Structured property analysis ----------

const PIPELINE_REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    approvalLikelihood: {
      type: Type.OBJECT,
      properties: {
        percentage: { type: Type.NUMBER },
        confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
        reasoning: { type: Type.STRING },
      },
      required: ["percentage", "confidence", "reasoning"],
    },
    nearbyExamples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          address: { type: Type.STRING },
          description: { type: Type.STRING },
          decision: { type: Type.STRING },
          decisionDate: { type: Type.STRING },
          relevance: { type: Type.STRING },
        },
        required: ["address", "description", "decision", "decisionDate", "relevance"],
      },
    },
    suggestedImprovements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          improvementType: { type: Type.STRING },
          approvalRate: { type: Type.STRING },
          description: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: ["improvementType", "approvalRate", "description", "reasoning"],
      },
    },
    costAndROI: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          improvementType: { type: Type.STRING },
          estimatedCostGBP: {
            type: Type.OBJECT,
            properties: { low: { type: Type.NUMBER }, high: { type: Type.NUMBER } },
            required: ["low", "high"],
          },
          estimatedValueAddGBP: {
            type: Type.OBJECT,
            properties: { low: { type: Type.NUMBER }, high: { type: Type.NUMBER } },
            required: ["low", "high"],
          },
          roiPercentage: { type: Type.NUMBER },
          notes: { type: Type.STRING },
        },
        required: ["improvementType", "estimatedCostGBP", "estimatedValueAddGBP", "roiPercentage", "notes"],
      },
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        postcode: { type: Type.STRING },
        council: { type: Type.STRING },
        searchRadiusMetres: { type: Type.NUMBER },
        applicationsAnalyzed: { type: Type.NUMBER },
        generatedAt: { type: Type.STRING },
      },
      required: ["postcode", "council", "searchRadiusMetres", "applicationsAnalyzed", "generatedAt"],
    },
  },
  required: ["approvalLikelihood", "nearbyExamples", "suggestedImprovements", "costAndROI", "metadata"],
};

function buildAnalysisSystemPrompt(
  input: PipelineInput,
  data: GatheredData
): string {
  const planningDataSection = data.ibexError
    ? `[Ibex data unavailable: ${data.ibexError}. Use your general knowledge of UK planning for this area.]`
    : JSON.stringify(data.nearbyApplications, null, 2);

  return `You are a UK property planning and home improvement analyst. Analyze the provided planning application data and property details to produce a structured assessment.

PROPERTY DETAILS:
- Postcode: ${input.postcode}
- Council: ${data.postcodeInfo.admin_district}
- Region: ${data.postcodeInfo.region}
- Property type: ${input.propertyType}
- Bedrooms: ${input.bedrooms}, Bathrooms: ${input.bathrooms}
- Description: ${input.propertyDescription}
- Planned work: ${input.plannedWork}

NEARBY PLANNING APPLICATIONS DATA:
${planningDataSection}

INSTRUCTIONS:

1. approvalLikelihood: Analyze the nearby applications data to estimate the likelihood of approval for "${input.plannedWork}". Consider:
   - How many similar projects (same type of work) were approved vs refused nearby
   - The council's general approval tendencies for householder applications
   - Any patterns in appeals data
   - The nature and scale of the planned work
   Give a percentage (0-100) and confidence level based on data quality.

2. nearbyExamples: Select 3-5 of the most relevant nearby applications similar to the planned work. Include both approved and refused examples where available. Use real data from the planning applications provided.

3. suggestedImprovements: Based on historically approved work in this area, suggest 3-5 additional home improvements the property owner could consider. Focus on improvements that have high approval rates in this specific council area and are suitable for a ${input.propertyType} with ${input.bedrooms} bedrooms.

4. costAndROI: For the planned work AND each suggested improvement, estimate:
   - Construction cost range (GBP) appropriate for ${data.postcodeInfo.region} in 2025
   - Expected property value increase range
   - ROI percentage
   Base costs on current UK construction industry rates for ${input.propertyType} properties in ${data.postcodeInfo.region}.

5. metadata: Fill in postcode, council name, search radius (will be provided), number of applications in the data, and current timestamp.`;
}

export async function analyzeProperty(
  input: PipelineInput,
  data: GatheredData,
  searchRadius: number
): Promise<PipelineReport> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const systemPrompt = buildAnalysisSystemPrompt(input, data);

  const userPrompt = `Analyze the planning approval likelihood for a ${input.plannedWork} on my ${input.propertyType} property at ${input.postcode}. ${input.propertyDescription}. Provide the full structured report with approval likelihood, nearby examples, suggested improvements, and cost/ROI estimates.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: PIPELINE_REPORT_SCHEMA,
      temperature: 0.2,
    },
  });

  const parsed = JSON.parse(response.text ?? "{}") as PipelineReport;

  // Fill in metadata fields the pipeline controls
  parsed.metadata.postcode = input.postcode;
  parsed.metadata.council = data.postcodeInfo.admin_district;
  parsed.metadata.searchRadiusMetres = searchRadius;
  parsed.metadata.generatedAt = new Date().toISOString();

  return parsed;
}

// CLI usage:
//   npx tsx gemini.ts "prompt"
//   npx tsx gemini.ts "prompt" -0.1278 51.5074
if (require.main === module) {
  const prompt =
    process.argv[2] ?? "What planning applications are near the London Eye?";
  const lng = process.argv[3] ? parseFloat(process.argv[3]) : undefined;
  const lat = process.argv[4] ? parseFloat(process.argv[4]) : undefined;

  console.log("User:", prompt);
  if (lng !== undefined && lat !== undefined) {
    console.log(`Location: [${lng}, ${lat}]`);
  }
  queryWithIbex(prompt, { lng, lat }).then((r) => console.log("Model:", r));
}
