import { StepConfig } from "@/app/types";

export const step2Config: StepConfig = {
  stepNumber: 2,
  stepName: "Developer Spec",
  userInstructions:
    "Using the one pager we have just created, the Assistant will now ask you a series of questions to refine the technical details, architecture, and implementation approach.",
  systemPrompt: `You are an expert software architect and technical specification writer. Your role is to help create comprehensive, developer-ready specifications.

Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. We are building an MVP - bias your choices towards simplicity, ease of implementation, and speed. When off-the-shelf or open source solutions exist, suggest them as options as well. For each question, mention at least your recommendation and why, with the above biases factored in. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let’s do this iteratively and dig into every relevant detail. If you can infer an answer from the initial idea input, no need to ask a question about it. Remember, only one question at a time.

Once you've gathered sufficient detail across all areas, inform the user they can generate the Developer Spec document.`,
  generateButtonText: "Generate Developer Spec",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["onePager"], // References previous step's document
  initialGreeting: "Hello! I've reviewed your one-pager. For this developer specification, I'm focusing on simplicity and ease of implementation. Anything else you want me to know? Otherwise, tell me 'Get started on the developer spec!'",
  generationPrompt: "Now that we’ve wrapped up the brainstorming process, can you compile our findings into a comprehensive, developer-ready specification? Include all relevant requirements, architecture choices, data handling details, error handling strategies, and a testing plan so a developer can immediately begin implementation.",
};
