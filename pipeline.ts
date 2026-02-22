/**
 * Property improvement analysis pipeline.
 * Orchestrates: postcodes.io → Ibex → Gemini structured analysis.
 *
 * Run: npx tsx pipeline.ts "E1 7BN" "2-bed Victorian terrace" terraced 2 1 "loft conversion"
 */

import { lookupPostcode } from "./postcodes";
import {
  fetchPipelineData,
  IbexResponse,
  testIbexConnection,
  type IbexConnectionCheck,
} from "./ibex";
import {
  analyzeProperty,
  PipelineInput,
  PipelineReport,
  GatheredData,
  testGeminiConnection,
  type GeminiConnectionCheck,
} from "./gemini";

export type { PipelineInput, PipelineReport, GatheredData };

export interface ConnectionDiagnostics {
  ok: boolean;
  gemini: GeminiConnectionCheck;
  ibex: IbexConnectionCheck;
  checkedAt: string;
}

// ---------- Core pipeline ----------

export async function runPipeline(input: PipelineInput): Promise<PipelineReport> {
  // Step 1: Geocode the postcode
  console.log(`[1/3] Looking up postcode ${input.postcode}...`);
  const geo = await lookupPostcode(input.postcode);
  console.log(
    `  → ${geo.admin_district}, ${geo.region} [${geo.latitude}, ${geo.longitude}]`
  );

  // Step 2: Fetch nearby planning data from Ibex
  console.log(`[2/3] Fetching nearby planning applications...`);
  let nearbyApplications: IbexResponse = {};
  let ibexError: string | undefined;
  let searchRadius = 500;

  try {
    nearbyApplications = await fetchPipelineData(
      geo.longitude,
      geo.latitude,
      searchRadius
    );

    // Count entries — Ibex returns { "<id>": { ...app }, ... }
    const appCount = Object.keys(nearbyApplications).length;
    console.log(`  → ${appCount} applications found within ${searchRadius}m`);
  } catch (err) {
    ibexError = (err as Error).message;
    console.log(`  → Ibex fetch failed: ${ibexError}`);
  }

  // Step 3: Gemini structured analysis
  console.log(`[3/3] Analyzing with Gemini...`);
  const gatheredData: GatheredData = {
    postcodeInfo: {
      latitude: geo.latitude,
      longitude: geo.longitude,
      admin_district: geo.admin_district,
      region: geo.region,
    },
    nearbyApplications,
    ibexError,
  };

  const report = await analyzeProperty(input, gatheredData, searchRadius);
  return report;
}

export async function runConnectionDiagnostics(): Promise<ConnectionDiagnostics> {
  const [gemini, ibex] = await Promise.all([
    testGeminiConnection(),
    testIbexConnection(),
  ]);

  return {
    ok: gemini.ok && ibex.ok,
    gemini,
    ibex,
    checkedAt: new Date().toISOString(),
  };
}

// ---------- Report printer ----------

export function printReport(report: PipelineReport): void {
  console.log("\n========== PROPERTY IMPROVEMENT ANALYSIS ==========\n");

  console.log(`Council: ${report.metadata.council}`);
  console.log(`Postcode: ${report.metadata.postcode}`);
  console.log(`Applications analyzed: ${report.metadata.applicationsAnalyzed}`);
  console.log(`Search radius: ${report.metadata.searchRadiusMetres}m\n`);

  console.log("--- APPROVAL LIKELIHOOD ---");
  console.log(
    `${report.approvalLikelihood.percentage}% (confidence: ${report.approvalLikelihood.confidence})`
  );
  console.log(report.approvalLikelihood.reasoning);

  console.log("\n--- NEARBY EXAMPLES ---");
  for (const ex of report.nearbyExamples) {
    console.log(`  [${ex.decision}] ${ex.address}`);
    console.log(`    ${ex.description}`);
    if (ex.decisionDate) console.log(`    Date: ${ex.decisionDate}`);
    console.log(`    Relevance: ${ex.relevance}\n`);
  }

  console.log("--- SUGGESTED IMPROVEMENTS ---");
  for (const s of report.suggestedImprovements) {
    console.log(`  * ${s.improvementType} (${s.approvalRate})`);
    console.log(`    ${s.description}`);
    console.log(`    ${s.reasoning}\n`);
  }

  console.log("--- COST & ROI ESTIMATES ---");
  for (const c of report.costAndROI) {
    console.log(`  * ${c.improvementType}`);
    console.log(
      `    Cost: £${c.estimatedCostGBP.low.toLocaleString()}-£${c.estimatedCostGBP.high.toLocaleString()}`
    );
    console.log(
      `    Value add: £${c.estimatedValueAddGBP.low.toLocaleString()}-£${c.estimatedValueAddGBP.high.toLocaleString()}`
    );
    console.log(`    ROI: ${c.roiPercentage}%`);
    console.log(`    ${c.notes}\n`);
  }

  console.log("====================================================");
}

// ---------- CLI ----------

if (require.main === module) {
  const postcode = process.argv[2] ?? "E1 7BN";
  const desc = process.argv[3] ?? "Victorian terrace house";
  const type = (process.argv[4] ?? "terraced") as PipelineInput["propertyType"];
  const beds = parseInt(process.argv[5] ?? "2", 10);
  const baths = parseInt(process.argv[6] ?? "1", 10);
  const work = process.argv[7] ?? "loft conversion";

  const input: PipelineInput = {
    postcode,
    propertyDescription: desc,
    propertyType: type,
    bedrooms: beds,
    bathrooms: baths,
    plannedWork: work,
  };

  console.log("Input:", JSON.stringify(input, null, 2));
  runPipeline(input)
    .then((report) => printReport(report))
    .catch((err) => console.error("Pipeline error:", (err as Error).message));
}
