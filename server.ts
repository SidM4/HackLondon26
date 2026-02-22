/**
 * HTTP server that exposes the analysis pipeline as a REST API.
 * Run: npx tsx server.ts
 * Endpoint: POST /analyse
 */

import * as http from "http";
import { runPipeline } from "./pipeline";
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
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/analyse") {
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
      console.error("[analyse] Error:", (err as Error).message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: (err as Error).message }));
    }
    return;
  }

  // Health check
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
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
});
