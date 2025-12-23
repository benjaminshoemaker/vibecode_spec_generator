import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

import { questionOptionsSchema } from "@/app/schemas/questionOptions";

export const runtime = "edge";

const systemPrompt = [
  "You generate multiple-choice options for a clarifying question in a product requirements chat.",
  "",
  "Hard rules:",
  '- Return JSON that matches the provided schema exactly, with keys in this order: reasoning, options, recommendedIndex, confidence.',
  "- reasoning MUST come first and be a brief analysis before committing to options.",
  "- options MUST be 3-6 distinct, specific, concrete options that are plausible answers to the question.",
  '- Do not include generic options like "Other", "None of the above", or vague placeholders.',
  '- Never include: "Other", "None of the above", "Something else".',
  "- recommendedIndex MUST be a 0-based index into options or null if no safe recommendation.",
  '- confidence MUST be one of: "weak" | "medium" | "strong".',
].join("\n");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questionText = body?.questionText;
    const conversationSummary = body?.conversationSummary;

    if (typeof questionText !== "string" || questionText.trim().length === 0) {
      return new Response("questionText is required", { status: 400 });
    }

    const modelName =
      process.env.OPENAI_OPTIONS_MODEL || process.env.OPENAI_MODEL || "gpt-4o";

    const prompt = [
      "CONVERSATION SUMMARY:",
      typeof conversationSummary === "string" && conversationSummary.trim().length > 0
        ? conversationSummary.trim()
        : "(none)",
      "",
      "QUESTION:",
      questionText.trim(),
    ].join("\n");

    const result = streamObject({
      model: openai(modelName),
      system: systemPrompt,
      prompt,
      schema: questionOptionsSchema,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Generate options API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate options" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

