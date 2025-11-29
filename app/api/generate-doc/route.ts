import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { spikelog } from "@/app/utils/spikelog";

export const runtime = "edge";

export async function POST(req: Request) {
  const startTime = Date.now();
  let stepName: string | undefined;

  try {
    const body = await req.json();
    stepName = body.stepName;
    const { chatHistory, documentInputs, generationPrompt: customPrompt } = body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return new Response("Invalid chat history format", { status: 400 });
    }

    if (!stepName) {
      return new Response("Step name is required", { status: 400 });
    }

    // Build generation prompt - ALWAYS use chat history as primary source
    let generationPrompt = "";

    // Prepend custom generation prompt if provided
    if (customPrompt) {
      generationPrompt = customPrompt + "\n\n";
    }

    // Format conversation history
    const conversationHistory = chatHistory
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n");

    // Add previous documents as additional context if available
    if (documentInputs && Object.keys(documentInputs).length > 0) {
      let documentContext = "You also have access to these previously generated documents for context:\n\n";

      for (const [key, value] of Object.entries(documentInputs)) {
        documentContext += `### ${key}:\n${value}\n\n`;
      }

      generationPrompt += documentContext;
    }

    // Always use conversation history as the primary source
    generationPrompt += `Based on the conversation history below, generate a comprehensive ${stepName} document in markdown format. The document should be well-structured, professional, and include all relevant details discussed in the conversation.

Conversation history:
${conversationHistory}

Please generate the ${stepName} document now in markdown format:`;

    // Log the request details
    console.log("\n" + "=".repeat(80));
    console.log("📄 GENERATE DOCUMENT API REQUEST");
    console.log("=".repeat(80));
    console.log(`\n📝 Step Name: ${stepName}`);
    console.log(`\n💬 Chat Messages: ${chatHistory.length}`);
    if (documentInputs && Object.keys(documentInputs).length > 0) {
      console.log("\n📚 Previous Documents:");
      Object.keys(documentInputs).forEach((key) => {
        console.log(`  - ${key}`);
      });
    }
    console.log("\n🎯 Full Generation Prompt:");
    console.log("-".repeat(80));
    console.log(generationPrompt);
    console.log("-".repeat(80) + "\n");

    const modelName = process.env.OPENAI_MODEL || "gpt-4o";
    console.log(`🔧 Using model: ${modelName}\n`);

    const result = streamText({
      model: openai(modelName),
      prompt: generationPrompt,
    });

    console.log("\n✅ Document generation stream started");
    console.log("=".repeat(80) + "\n");

    // Track response time (#2) and success (#12)
    spikelog.trackApiResponseTime("generate", Date.now() - startTime);
    spikelog.trackGenerationResult(true, stepName);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Generate doc API error:", error);

    // Track API error (#11) and failure (#12)
    spikelog.trackApiError(
      "generate",
      error instanceof Error ? error.name : "Unknown"
    );
    spikelog.trackGenerationResult(false, stepName);

    return new Response(
      JSON.stringify({ error: "Failed to generate document" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
