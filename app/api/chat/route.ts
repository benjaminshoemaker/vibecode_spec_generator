import { openai } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, documentInputs, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Build full system prompt with document context if available
    let fullSystemPrompt = systemPrompt || "You are a helpful assistant.";

    if (documentInputs && Object.keys(documentInputs).length > 0) {
      let documentContext = "\n\n--- PREVIOUS DOCUMENTS FOR CONTEXT ---\n\n";
      for (const [key, value] of Object.entries(documentInputs)) {
        documentContext += `### ${key}:\n${value}\n\n`;
      }
      documentContext += "--- END OF PREVIOUS DOCUMENTS ---\n";
      fullSystemPrompt = fullSystemPrompt + documentContext;
    }

    // Log the request details
    console.log("\n" + "=".repeat(80));
    console.log("🤖 CHAT API REQUEST");
    console.log("=".repeat(80));
    console.log("\n📋 System Prompt:");
    console.log(fullSystemPrompt);
    console.log("\n💬 Messages:");
    messages.forEach((msg, idx) => {
      console.log(`\n[${idx + 1}] ${msg.role.toUpperCase()}:`);
      console.log(msg.content);
    });
    console.log("\n" + "=".repeat(80) + "\n");

    const modelName = process.env.OPENAI_MODEL || "gpt-4o";
    console.log(`🔧 Using model: ${modelName}\n`);

    if (stream) {
      const result = streamText({
        model: openai(modelName),
        system: fullSystemPrompt,
        messages,
      });

      return result.toTextStreamResponse();
    }

    const result = await generateText({
      model: openai(modelName),
      system: fullSystemPrompt,
      messages,
    });

    return new Response(result.text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
