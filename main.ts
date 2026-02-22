/**
 * Interactive CLI for Ibex Planning + Gemini assistant.
 * Run: npx tsx main.ts
 */

import * as readline from "readline";
import { queryWithIbex, QueryOptions, PipelineInput } from "./gemini";
import { runPipeline, printReport } from "./pipeline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

// Default location: central London
let currentOpts: QueryOptions = { lng: -0.1278, lat: 51.5074, radius: 500 };

async function runAnalyze() {
  const postcode = await question("  Postcode: ");
  const desc = await question("  Property description: ");
  const typeRaw = await question(
    "  Property type (detached/semi-detached/terraced/flat/bungalow/other): "
  );
  const beds = parseInt(await question("  Bedrooms: "), 10);
  const baths = parseInt(await question("  Bathrooms: "), 10);
  const work = await question(
    "  Planned work (e.g. loft conversion, rear extension): "
  );

  const input: PipelineInput = {
    postcode: postcode.trim(),
    propertyDescription: desc.trim(),
    propertyType: (typeRaw.trim() || "other") as PipelineInput["propertyType"],
    bedrooms: isNaN(beds) ? 0 : beds,
    bathrooms: isNaN(baths) ? 0 : baths,
    plannedWork: work.trim(),
  };

  console.log("\nAnalyzing... (this may take 10-20 seconds)\n");
  const report = await runPipeline(input);
  printReport(report);
}

function ask() {
  rl.question(
    "\nPrompt (or /analyze, /loc lng lat, /radius N, /quit): ",
    async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed === "/quit") {
        rl.close();
        return;
      }
      if (trimmed === "/analyze") {
        try {
          await runAnalyze();
        } catch (err) {
          console.error("Analysis error:", (err as Error).message);
        }
        return ask();
      }
      if (trimmed.startsWith("/loc ")) {
        const parts = trimmed.split(/\s+/);
        currentOpts.lng = parseFloat(parts[1]);
        currentOpts.lat = parseFloat(parts[2]);
        console.log(
          `Location set to [${currentOpts.lng}, ${currentOpts.lat}]`
        );
        return ask();
      }
      if (trimmed.startsWith("/radius ")) {
        currentOpts.radius = parseInt(trimmed.split(/\s+/)[1], 10);
        console.log(`Radius set to ${currentOpts.radius}m`);
        return ask();
      }

      try {
        console.log("Thinking...");
        const reply = await queryWithIbex(trimmed, currentOpts);
        console.log("\nAssistant:", reply);
      } catch (err) {
        console.error("Error:", (err as Error).message);
      }
      ask();
    }
  );
}

console.log("=== Ibex Planning + Gemini Assistant ===");
console.log(
  `Default location: London [${currentOpts.lng}, ${currentOpts.lat}], radius ${currentOpts.radius}m`
);
console.log(
  "Commands: /analyze, /loc <lng> <lat>, /radius <metres>, /quit\n"
);
ask();
