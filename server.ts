/**
 * HTTP server that exposes the analysis pipeline as a REST API.
 * Run: npx tsx server.ts
 * Endpoint: POST /analyse
 */

import * as http from "http";
import { runConnectionDiagnostics, runPipeline } from "./pipeline";
import type { PipelineInput, PipelineReport } from "./gemini";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ---------- Request / Response types (matches frontend) ----------

interface AnalyseRequest {
  postcode: string;
  property_description: {
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    other_details?: string;
  };
  work_type: string;
}

interface Precedent {
  app_id: string;
  decision: "approved" | "refused";
  date: string;
  title: string;
  url?: string;
}

interface SuggestedImprovement {
  work_type: string;
  work_type_label: string;
  estimated_cost: number;
  value_added: number;
  approval_probability: number;
  description: string;
}

interface AnalyseResponse {
  approval_probability: number;
  confidence: number;
  precedents: Precedent[];
  suggested_improvements: SuggestedImprovement[];
  location_insights?: string;
}

// ---------- Mapping ----------

function mapRequestToPipelineInput(req: AnalyseRequest): PipelineInput {
  // Map frontend work_type id to human-readable string
  const workLabel = req.work_type.replace(/_/g, " ");

  // Map frontend property_type to pipeline enum
  const typeMap: Record<string, PipelineInput["propertyType"]> = {
    house: "detached",
    detached: "detached",
    "semi-detached": "semi-detached",
    semi: "semi-detached",
    terraced: "terraced",
    terrace: "terraced",
    flat: "flat",
    apartment: "flat",
    bungalow: "bungalow",
    villa: "detached",
  };
  const propType =
    typeMap[req.property_description.property_type.toLowerCase()] ?? "other";

  return {
    postcode: req.postcode,
    propertyDescription:
      req.property_description.other_details ||
      `${req.property_description.property_type} with ${req.property_description.bedrooms} bedrooms`,
    propertyType: propType,
    bedrooms: req.property_description.bedrooms,
    bathrooms: req.property_description.bathrooms,
    plannedWork: workLabel,
  };
}

function mapPipelineReportToResponse(report: PipelineReport): AnalyseResponse {
  // Approval probability: pipeline returns 0-100, frontend expects 0-1
  const approvalProbability = report.approvalLikelihood.percentage / 100;

  // Confidence: map text to numeric interval
  const confidenceMap: Record<string, number> = {
    high: 0.05,
    medium: 0.1,
    low: 0.15,
  };
  const confidence =
    confidenceMap[report.approvalLikelihood.confidence] ?? 0.1;

  // Map nearby examples to precedents
  const precedents: Precedent[] = report.nearbyExamples.map((ex, i) => ({
    app_id: `IBEX-${i + 1}`,
    decision: ex.decision.toLowerCase().includes("approv")
      ? ("approved" as const)
      : ("refused" as const),
    date: ex.decisionDate || "Unknown",
    title: `${ex.description}, ${ex.address}`,
  }));

  // Merge suggestedImprovements with costAndROI
  const costMap = new Map<string, (typeof report.costAndROI)[0]>();
  for (const c of report.costAndROI) {
    costMap.set(c.improvementType.toLowerCase(), c);
  }

  const suggestedImprovements: SuggestedImprovement[] =
    report.suggestedImprovements.map((s) => {
      const cost = costMap.get(s.improvementType.toLowerCase());
      const workType = s.improvementType
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      return {
        work_type: workType,
        work_type_label: s.improvementType,
        estimated_cost: cost
          ? Math.round((cost.estimatedCostGBP.low + cost.estimatedCostGBP.high) / 2)
          : 0,
        value_added: cost
          ? Math.round(
              (cost.estimatedValueAddGBP.low + cost.estimatedValueAddGBP.high) / 2
            )
          : 0,
        approval_probability: parseApprovalRate(s.approvalRate),
        description: s.description,
      };
    });

  return {
    approval_probability: approvalProbability,
    confidence,
    precedents,
    suggested_improvements: suggestedImprovements,
    location_insights: report.approvalLikelihood.reasoning,
  };
}

function parseApprovalRate(rate: string): number {
  // Extract number from strings like "85%", "High (85%)", "High"
  const match = rate.match(/(\d+)/);
  if (match) return parseInt(match[1], 10) / 100;
  const lowerRate = rate.toLowerCase();
  if (lowerRate.includes("very high")) return 0.9;
  if (lowerRate.includes("high")) return 0.8;
  if (lowerRate.includes("medium")) return 0.6;
  if (lowerRate.includes("low")) return 0.4;
  return 0.5;
}

// ---------- Error classification ----------

function classifyError(raw: string): { status: number; error: string } {
  // Invalid postcode (from postcodes.io 404)
  if (raw.startsWith("Invalid postcode")) {
    return { status: 400, error: raw };
  }

  // postcodes.io service errors
  if (raw.includes("postcodes.io")) {
    return { status: 502, error: "Postcode lookup service is unavailable. Please try again." };
  }

  // Ibex API errors
  if (raw.includes("Ibex")) {
    return { status: 502, error: "Planning data service (Ibex) is unavailable. Please try again." };
  }

  // Gemini rate limit / quota exhausted
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("quota")) {
    return {
      status: 429,
      error: "AI analysis rate limit reached. Please wait a minute and try again.",
    };
  }

  // Gemini token limit (should be handled by fitToTokenBudget, but just in case)
  if (raw.includes("input token count exceeds")) {
    return {
      status: 422,
      error: "Too much planning data for this area to analyse. Try a more specific postcode.",
    };
  }

  // Gemini API key / auth issues
  if (raw.includes("API_KEY") || raw.includes("PERMISSION_DENIED")) {
    return { status: 503, error: "AI service configuration error. Please contact support." };
  }

  // JSON parse failures (malformed Gemini response)
  if (raw.includes("JSON") || raw.includes("Unexpected token")) {
    return { status: 502, error: "AI returned an invalid response. Please try again." };
  }

  // Generic fallback
  return { status: 500, error: "Something went wrong. Please try again." };
}

// ---------- HTTP Server ----------

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && pathname === "/analyse") {
    try {
      const body = await readBody(req);
      const analyseReq: AnalyseRequest = JSON.parse(body);

      console.log(
        `[analyse] postcode=${analyseReq.postcode} work=${analyseReq.work_type}`
      );

      const pipelineInput = mapRequestToPipelineInput(analyseReq);
      const report = await runPipeline(pipelineInput);
      const response = mapPipelineReportToResponse(report);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (err) {
      const raw = (err as Error).message ?? String(err);
      console.error("[analyse] Error:", raw);

      const { status, error } = classifyError(raw);
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error }));
    }
    return;
  }

  if (req.method === "GET" && pathname === "/diagnostics/connections") {
    try {
      const diagnostics = await runConnectionDiagnostics();
      res.writeHead(diagnostics.ok ? 200 : 503, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(diagnostics));
    } catch (err) {
      const raw = (err as Error).message ?? String(err);
      console.error("[diagnostics] Error:", raw);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: raw }));
    }
    return;
  }

  // Health check
  if (req.method === "GET" && (pathname === "/" || pathname === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`POST /analyse — run property analysis pipeline`);
  console.log(
    `GET /diagnostics/connections — lightweight Gemini + Ibex connectivity checks`
  );
});
