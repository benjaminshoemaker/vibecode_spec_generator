import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { chatHistory, stepName, documentInputs, generationPrompt: customPrompt } = await req.json();

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

    const result = await generateText({
      model: openai(modelName),
      prompt: generationPrompt,
    });

    console.log(`\n✅ Document generated (${result.text.length} characters)`);
    console.log("=".repeat(80) + "\n");

    return new Response(JSON.stringify({ document: result.text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate doc API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate document" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
