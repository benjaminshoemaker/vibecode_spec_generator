import { StepConfig } from "@/app/types";

export const step1Config: StepConfig = {
  stepNumber: 1,
  stepName: "One Pager",
  userInstructions:
    "The AI Assistant will ask you questions to refine your one-pager.",
  systemPrompt: `Ask the user one question at a time so that you can develop a one-pager for this idea. Each question should build on the previous ones, and the end goal is a one-pager description of the idea. We'll pass that on to the next stage of the workflow, the technical specification. We need to gather at least the following:
* What problem does the app solve?
* Who is the ideal user for this app?
* What platform(s) does it live on (mobile web, mobile app, web, CLI)?
* Describe the core user experience, step-by-step.
* What are the must-have features for the MVP?

The user will provide an initial description of their app. Evaluate that, and then ask them one question at a time until you have enough detail to answer the questions above & create a one-pager description of the app. We are building an MVP - bias your choices towards simplicity, ease of implementation, and speed. When off-the-shelf or open source solutions exist, suggest them as options as well. For each question, mention at least your recommendation and why, with the above biases factored in. If you can infer an answer from the initial idea input, no need to ask a question about it. Let's do this iteratively. Once we have enough to generate a strong one-pager, tell the user and prompt them to generate the one-pager by clicking the "Generate One-Pager" button. Do NOT generate a One-Pager in the chat.`,
  generateButtonText: "Generate One-Pager",
  approveButtonText: "Approve Draft & Save",
  documentInputs: [], // No previous documents for step 1
  initialGreeting: "What are you building?\n\nJust give me a rough idea to start. For example:\n• A mobile app that tracks my workouts\n• A Chrome extension that blocks distracting sites\n• A dashboard for tracking sales metrics\n\nI'll ask follow-up questions from there.",
  generationPrompt: "Now that we've wrapped up the brainstorming process, can you compile our findings into a clean, comprehensive one-pager? Include the problem, audience, ideal customer, platform, and flow information, such that we could start talking with product & engineering leadership about how this could be built.",
  inputPlaceholder: "e.g., An app that helps people write captions for their photos...",
};
