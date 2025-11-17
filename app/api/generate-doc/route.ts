import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { chatHistory, stepName, documentInputs } = await req.json();

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return new Response("Invalid chat history format", { status: 400 });
    }

    if (!stepName) {
      return new Response("Step name is required", { status: 400 });
    }

    // Build context from previous documents
    let generationPrompt = "";

    if (documentInputs && Object.keys(documentInputs).length > 0) {
      // For steps with previous documents, use ONLY documents as context
      let documentContext = `Based on the following documents, generate a comprehensive ${stepName} document in markdown format. The document should be well-structured, professional, and expand upon the information provided.\n\nPrevious documents:\n`;

      for (const [key, value] of Object.entries(documentInputs)) {
        documentContext += `\n### ${key}:\n${value}\n`;
      }

      documentContext += `\n\nUsing the information from the documents above, generate the ${stepName} document now in markdown format:`;
      generationPrompt = documentContext;
    } else {
      // For first step, use chat history since there are no previous documents
      const conversationHistory = chatHistory
        .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n\n");

      generationPrompt = `Based on the conversation history below, generate a comprehensive ${stepName} document in markdown format. The document should be well-structured, professional, and include all relevant details discussed in the conversation.

Conversation history:
${conversationHistory}

Please generate the ${stepName} document now in markdown format:`;
    }

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
