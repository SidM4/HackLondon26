/**
 * Ibex Planning Approval API client.
 * Wraps /search, /applications, and /stats endpoints.
 */

import { IBEX_JWT_TOKEN } from "./secrets";

const IBEX_BASE = "https://ibex.seractech.co.uk";

// ---------- Types ----------

export type IbexExtensionKey =
  | "appeals"
  | "centre_point"
  | "heading"
  | "project_type"
  | "num_new_houses"
  | "document_metadata"
  | "proposed_unit_mix"
  | "proposed_floor_area"
  | "num_comments_received";

export type IbexExtensions = Partial<Record<IbexExtensionKey, boolean>>;

// Keep old type alias for tools.ts compatibility
export type IbexExtension = IbexExtensionKey;

export interface SearchInput {
  srid: number;
  coordinates: [number, number]; // [lng, lat]
  radius: number;
}

export interface SearchRequest {
  input: SearchInput;
  extensions?: IbexExtensions;
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

export interface IbexConnectionCheck {
  ok: boolean;
  latencyMs: number;
  sampleApplicationCount?: number;
  error?: string;
}

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
    extensions: { heading: true, project_type: true, num_comments_received: true },
  });
  return JSON.stringify(result, null, 2);
}

// ---------- Pipeline-specific fetch ----------

export async function fetchPipelineData(
  lng: number,
  lat: number,
  radiusMetres: number = 500
): Promise<IbexResponse> {
  return ibexSearch({
    input: { srid: 4326, coordinates: [lng, lat], radius: radiusMetres },
    extensions: {
      heading: true,
      project_type: true,
      proposed_floor_area: true,
      appeals: true,
      num_comments_received: true,
      num_new_houses: true,
    },
  });
}

/**
 * Lightweight Ibex connectivity check to avoid large data pulls.
 * Uses a tiny radius and no extensions.
 */
export async function testIbexConnection(): Promise<IbexConnectionCheck> {
  const started = Date.now();
  try {
    const result = await ibexSearch({
      input: {
        srid: 4326,
        coordinates: [-0.1276, 51.5072],
        radius: 10,
      },
      extensions: {},
    });

    return {
      ok: true,
      latencyMs: Date.now() - started,
      sampleApplicationCount: Object.keys(result).length,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: (err as Error).message ?? String(err),
    };
  }
}
