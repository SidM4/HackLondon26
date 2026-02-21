/**
 * Interactive CLI for Ibex Planning + Gemini assistant.
 * Run: npx tsx main.ts
 */

import * as readline from "readline";
import { queryWithIbex, QueryOptions } from "./gemini";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Default location: central London
let currentOpts: QueryOptions = { lng: -0.1278, lat: 51.5074, radius: 500 };

function ask() {
  rl.question("\nPrompt (or /loc lng lat, /radius N, /quit): ", async (input) => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === "/quit") {
      rl.close();
      return;
    }
    if (trimmed.startsWith("/loc ")) {
      const parts = trimmed.split(/\s+/);
      currentOpts.lng = parseFloat(parts[1]);
      currentOpts.lat = parseFloat(parts[2]);
      console.log(`Location set to [${currentOpts.lng}, ${currentOpts.lat}]`);
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
  });
}

console.log("=== Ibex Planning + Gemini Assistant ===");
console.log(
  `Default location: London [${currentOpts.lng}, ${currentOpts.lat}], radius ${currentOpts.radius}m`
);
console.log("Commands: /loc <lng> <lat>, /radius <metres>, /quit\n");
ask();
