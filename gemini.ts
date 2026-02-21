/**
 * Simple Gemini input → output interface.
 * Send a prompt, get a response. No chat history.
 */

import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY as SECRET_API_KEY } from "./secrets";

function getApiKey(): string {
  // Try secrets.ts first, then environment
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

export async function query(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  return (response.text ?? "").trim();
}

// CLI usage: npx tsx gemini.ts "your prompt"
if (require.main === module) {
  const prompt = process.argv[2] ?? "What is 2 + 2? Reply briefly.";
  console.log("User:", prompt);
  query(prompt).then((reply) => console.log("Model:", reply));
}
