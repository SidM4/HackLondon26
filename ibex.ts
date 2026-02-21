/**
 * Ibex Planning Approval API client.
 * Wraps /search, /applications, and /stats endpoints.
 */

import { IBEX_JWT_TOKEN } from "./secrets";

const IBEX_BASE = "https://ibex.seractech.co.uk";

// ---------- Types ----------

export type IbexExtension =
  | "planning_appeals"
  | "headings_summaries"
  | "project_type"
  | "housing_units"
  | "documents"
  | "residential_breakdowns"
  | "floor_area"
  | "public_comments";

export interface SearchInput {
  srid: number;
  coordinates: [number, number]; // [lng, lat]
  radius: number;
}

export interface SearchRequest {
  input: SearchInput;
  extensions?: IbexExtension[];
  filters?: Record<string, unknown>;
}

export interface ApplicationsInput {
  from: string; // YYYY-MM-DD
  to: string;
  council_ids: number[];
}

export interface ApplicationsRequest {
  input: ApplicationsInput;
}

export interface StatsInput {
  council_ids: number[];
}

export interface StatsRequest {
  input: StatsInput;
}

export type IbexResponse = Record<string, unknown>;

// ---------- Core HTTP helper ----------

function getIbexToken(): string {
  if (IBEX_JWT_TOKEN) return IBEX_JWT_TOKEN;
  const token = process.env.IBEX_JWT_TOKEN;
  if (!token) {
    throw new Error(
      "Set IBEX_JWT_TOKEN in secrets.ts or as an environment variable"
    );
  }
  return token;
}

async function ibexPost(path: string, body: object): Promise<IbexResponse> {
  const token = getIbexToken();
  const res = await fetch(`${IBEX_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ibex ${path} returned ${res.status}: ${text}`);
  }

  return res.json() as Promise<IbexResponse>;
}

// ---------- Endpoint wrappers ----------

export async function ibexSearch(req: SearchRequest): Promise<IbexResponse> {
  return ibexPost("/search", req);
}

export async function ibexApplications(
  req: ApplicationsRequest
): Promise<IbexResponse> {
  return ibexPost("/applications", req);
}

export async function ibexStats(req: StatsRequest): Promise<IbexResponse> {
  return ibexPost("/stats", req);
}

// ---------- Baseline fetch for context injection ----------

export async function fetchBaseline(
  lng: number,
  lat: number,
  radiusMetres: number = 500
): Promise<string> {
  const result = await ibexSearch({
    input: { srid: 4326, coordinates: [lng, lat], radius: radiusMetres },
    extensions: ["headings_summaries", "project_type", "public_comments"],
  });
  return JSON.stringify(result, null, 2);
}
