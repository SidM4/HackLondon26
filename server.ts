/**
 * Gemini-backed HTTP server for property planning analysis.
 * Run: npx tsx server.ts
 * Endpoints:
 *   - GET /health
 *   - POST /analyse
 */

import * as http from "http";
import { runPipeline } from "./pipeline";
import type { PipelineInput, PipelineReport } from "./gemini";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const MAX_BODY_BYTES = 1_000_000;

// ---------- API contract (frontend-compatible) ----------

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

// ---------- Errors ----------

class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ---------- Utils ----------

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function setCorsHeaders(res: http.ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += part.length;
    if (total > MAX_BODY_BYTES) {
      throw new HttpError(413, "payload_too_large", "Request body too large");
    }
    chunks.push(part);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    throw new HttpError(400, "invalid_json", "Request body is required");
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new HttpError(400, "invalid_json", "Malformed JSON body");
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function asSafeString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumberOrDefault(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseApprovalRate(rate: string): number {
  const match = rate.match(/(\d+)/);
  if (match) return clamp(parseInt(match[1], 10) / 100, 0, 1);

  const lower = rate.toLowerCase();
  if (lower.includes("very high")) return 0.9;
  if (lower.includes("high")) return 0.8;
  if (lower.includes("medium")) return 0.6;
  if (lower.includes("low")) return 0.4;
  return 0.5;
}

// ---------- Validation & mapping ----------

function parseAnalyseRequest(body: unknown): AnalyseRequest {
  if (!isObject(body)) {
    throw new HttpError(400, "invalid_request", "Request body must be a JSON object");
  }

  const postcode = asSafeString(body.postcode);
  const workType = asSafeString(body.work_type);
  const propertyDescription = body.property_description;

  if (!postcode) {
    throw new HttpError(400, "invalid_request", "postcode is required");
  }
  if (!workType) {
    throw new HttpError(400, "invalid_request", "work_type is required");
  }
  if (!isObject(propertyDescription)) {
    throw new HttpError(
      400,
      "invalid_request",
      "property_description must be an object"
    );
  }

  const propertyType = asSafeString(propertyDescription.property_type);
  const bedrooms = asNumberOrDefault(propertyDescription.bedrooms, 0);
  const bathrooms = asNumberOrDefault(propertyDescription.bathrooms, 0);
  const otherDetails = asSafeString(propertyDescription.other_details);

  return {
    postcode,
    work_type: workType,
    property_description: {
      property_type: propertyType,
      bedrooms,
      bathrooms,
      other_details: otherDetails || undefined,
    },
  };
}

function mapRequestToPipelineInput(req: AnalyseRequest): PipelineInput {
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

  const rawType = req.property_description.property_type.toLowerCase();
  const propertyType = typeMap[rawType] ?? "other";
  const bedrooms = clamp(Math.round(req.property_description.bedrooms), 0, 20);
  const bathrooms = clamp(Math.round(req.property_description.bathrooms), 0, 20);
  const plannedWork = req.work_type.replace(/_/g, " ").trim();

  return {
    postcode: req.postcode,
    propertyDescription:
      req.property_description.other_details ||
      `${req.property_description.property_type || "Property"} with ${bedrooms} bedrooms`,
    propertyType,
    bedrooms,
    bathrooms,
    plannedWork,
  };
}

function mapPipelineReportToResponse(report: PipelineReport): AnalyseResponse {
  const approvalProbability = clamp(report.approvalLikelihood.percentage / 100, 0, 1);
  const confidenceMap: Record<string, number> = {
    high: 0.05,
    medium: 0.1,
    low: 0.15,
  };
  const confidence = confidenceMap[report.approvalLikelihood.confidence] ?? 0.1;

  const precedents: Precedent[] = report.nearbyExamples.map((example, idx) => ({
    app_id: `IBEX-${idx + 1}`,
    decision: example.decision.toLowerCase().includes("approv")
      ? "approved"
      : "refused",
    date: example.decisionDate || "Unknown",
    title: `${example.description}, ${example.address}`,
  }));

  const roiByType = new Map<string, (typeof report.costAndROI)[number]>();
  for (const roi of report.costAndROI) {
    roiByType.set(roi.improvementType.toLowerCase(), roi);
  }

  const suggestedImprovements: SuggestedImprovement[] = report.suggestedImprovements.map(
    (item) => {
      const roi = roiByType.get(item.improvementType.toLowerCase());
      const averageCost = roi
        ? Math.round((roi.estimatedCostGBP.low + roi.estimatedCostGBP.high) / 2)
        : 0;
      const averageValue = roi
        ? Math.round(
            (roi.estimatedValueAddGBP.low + roi.estimatedValueAddGBP.high) / 2
          )
        : 0;

      return {
        work_type: slugify(item.improvementType),
        work_type_label: item.improvementType,
        estimated_cost: averageCost,
        value_added: averageValue,
        approval_probability: parseApprovalRate(item.approvalRate),
        description: item.description,
      };
    }
  );

  return {
    approval_probability: approvalProbability,
    confidence,
    precedents,
    suggested_improvements: suggestedImprovements,
    location_insights: report.approvalLikelihood.reasoning,
  };
}

// ---------- Route handlers ----------

async function handleAnalyse(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const body = await readJsonBody(req);
  const analyseReq = parseAnalyseRequest(body);

  console.log(`[analyse] postcode=${analyseReq.postcode} work=${analyseReq.work_type}`);
  const pipelineInput = mapRequestToPipelineInput(analyseReq);
  const report = await runPipeline(pipelineInput);
  const response = mapPipelineReportToResponse(report);

  sendJson(res, 200, response);
}

function handleNotFound(res: http.ServerResponse): void {
  sendJson(res, 404, { error: "Not found" });
}

function handleError(res: http.ServerResponse, err: unknown): void {
  if (err instanceof HttpError) {
    sendJson(res, err.statusCode, { error: err.message, code: err.code });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  sendJson(res, 500, { error: message, code: "internal_error" });
}

// ---------- Server ----------

export function startServer(port: number = PORT): http.Server {
  const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
        sendJson(res, 200, { status: "ok", service: "gemini-analysis-server" });
        return;
      }

      if (req.method === "POST" && req.url === "/analyse") {
        await handleAnalyse(req, res);
        return;
      }

      handleNotFound(res);
    } catch (err) {
      console.error("[server] Error:", err);
      handleError(res, err);
    }
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log("POST /analyse — run Gemini + Ibex property analysis");
  });

  return server;
}

if (require.main === module) {
  startServer();
}
