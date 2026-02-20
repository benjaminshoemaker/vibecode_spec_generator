import { streamText, generateText } from "ai";
import { spikelog } from "@/app/utils/spikelog";
import { getModel } from "@/app/utils/ai-provider";

export const runtime = "edge";

export async function POST(req: Request) {
  const startTime = Date.now();

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
    console.log(`🔧 Using model: ${modelName} (provider: ${process.env.AI_PROVIDER || "openai"})\n`);

    if (stream) {
      const result = streamText({
        model: getModel(modelName),
        system: fullSystemPrompt,
        messages,
      });

      // Track response time for streaming (time to first byte)
      spikelog.trackApiResponseTime("chat", Date.now() - startTime);

      return result.toTextStreamResponse();
    }

    const result = await generateText({
      model: getModel(modelName),
      system: fullSystemPrompt,
      messages,
    });

    // Track response time for non-streaming
    spikelog.trackApiResponseTime("chat", Date.now() - startTime);

    return new Response(result.text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Track API error (#10)
    spikelog.trackApiError(
      "chat",
      error instanceof Error ? error.name : "Unknown"
    );

    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
