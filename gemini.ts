/**
 * Gemini query interface with Ibex Planning API integration.
 * - query(): Simple prompt → response (no Ibex)
 * - queryWithIbex(): Baseline Ibex fetch + function-calling loop
 */

import {
  GoogleGenAI,
  FunctionCallingConfigMode,
} from "@google/genai";
import type { Content, Part } from "@google/genai";
import { GEMINI_API_KEY as SECRET_API_KEY } from "./secrets";
import { fetchBaseline } from "./ibex";
import { ibexTools, dispatchIbexCall } from "./tools";

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
