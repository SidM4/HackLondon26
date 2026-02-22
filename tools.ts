/**
 * Gemini function-calling tool declarations for Ibex API.
 * Defines three tools (search, applications, stats) and a dispatcher.
 */

import { Type } from "@google/genai";
import type { FunctionDeclaration, FunctionCall } from "@google/genai";
import { ibexSearch, ibexApplications, ibexStats, IbexExtensions, IbexExtensionKey } from "./ibex";
import { lookupPostcode } from "./postcodes";

// ---------- Tool declarations ----------

export const ibexTools: FunctionDeclaration[] = [
  {
    name: "ibex_search",
    description:
      "Search for UK planning applications near a geographic location. " +
      "Returns applications within the specified radius of the coordinates.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        longitude: {
          type: Type.NUMBER,
          description: "Longitude of the search center (WGS84)",
        },
        latitude: {
          type: Type.NUMBER,
          description: "Latitude of the search center (WGS84)",
        },
        radius: {
          type: Type.NUMBER,
          description: "Search radius in metres (max recommended 500)",
        },
        extensions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Optional data extensions: appeals, heading, project_type, " +
            "num_new_houses, document_metadata, proposed_unit_mix, " +
            "proposed_floor_area, num_comments_received, centre_point",
        },
      },
      required: ["longitude", "latitude"],
    },
  },
  {
    name: "ibex_applications",
    description:
      "Get UK planning applications for specific councils within a date range.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        from: {
          type: Type.STRING,
          description: "Start date in YYYY-MM-DD format",
        },
        to: {
          type: Type.STRING,
          description: "End date in YYYY-MM-DD format",
        },
        council_ids: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER },
          description: "Array of council ID numbers",
        },
      },
      required: ["from", "to", "council_ids"],
    },
  },
  {
    name: "ibex_stats",
    description:
      "Get council-level UK planning statistics (approval rates, processing times, etc.).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        council_ids: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER },
          description: "Array of council ID numbers",
        },
      },
      required: ["council_ids"],
    },
  },
  {
    name: "postcode_lookup",
    description:
      "Look up a UK postcode to get latitude, longitude, council, and region information.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        postcode: {
          type: Type.STRING,
          description: "UK postcode (e.g. 'SW1A 1AA', 'E1 7BN')",
        },
      },
      required: ["postcode"],
    },
  },
];

// ---------- Dispatcher ----------

export async function dispatchIbexCall(
  call: FunctionCall
): Promise<Record<string, unknown>> {
  const args = call.args ?? {};

  try {
    switch (call.name) {
      case "ibex_search": {
        const result = await ibexSearch({
          input: {
            srid: 4326,
            coordinates: [Number(args.longitude), Number(args.latitude)],
            radius: Number(args.radius ?? 500),
          },
          extensions: Array.isArray(args.extensions)
            ? Object.fromEntries(
                (args.extensions as string[]).map((k) => [k, true])
              ) as IbexExtensions
            : undefined,
        });
        return { output: result };
      }
      case "ibex_applications": {
        const result = await ibexApplications({
          input: {
            from: String(args.from),
            to: String(args.to),
            council_ids: (args.council_ids as number[]) ?? [],
          },
        });
        return { output: result };
      }
      case "ibex_stats": {
        const result = await ibexStats({
          input: {
            council_ids: (args.council_ids as number[]) ?? [],
          },
        });
        return { output: result };
      }
      case "postcode_lookup": {
        const result = await lookupPostcode(String(args.postcode));
        return { output: result };
      }
      default:
        return { error: `Unknown function: ${call.name}` };
    }
  } catch (err) {
    return { error: (err as Error).message };
  }
}
