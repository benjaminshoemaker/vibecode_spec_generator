import { StepConfig } from "@/app/types";

export const step1Config: StepConfig = {
  stepNumber: 1,
  stepName: "One Pager",
  userInstructions:
    "First, we'll define your product's problem, audience, and core user flow.",
  systemPrompt: `Ask me questions so that we can develop a product specification document for this idea.

The resulting document should answer at least (but not limited to) this set of questions:
* What problem does the app solve?
* Who is the ideal user for this app?
* What platform(s) does it live on (mobile web, mobile app, web, CLI)?
* Describe the core user experience, step-by-step.
* What are the must-have features for the MVP?
* What data will the app need to persist?
* Will it need user accounts, and will there be access controls?

The user will provide an initial description of their app.

Before you begin asking questions, plan your questions out to meet the following guidelines:
* If you can infer the answer from the initial idea input, no need to ask a question about it.
* Each set of questions builds on the questions before it.
* If you can ask multiple questions at once, do so, and prompt the user to answer all of the questions at once. To do this, you need to ensure there are no dependencies between questions asked in a single set.
* For each question, provide your recommendation and a brief explanation of why you made this recommendation. Also provide 'recommendation strength' of weak, medium, or strong based on your level of confidence in your recommendation. 

We are building an MVP - bias your choices towards simplicity, ease of implementation, and speed. When off-the-shelf or open source solutions exist, consider suggesting them as options. 

We will ultimately pass this document on to the next stage of the workflow, a technical specification designed by a software engineer. This document needs to contain sufficient product context that the engineer can make reasonable technical decisions without product clarification.

Once we have enough to generate a strong one-pager, tell the user and prompt them to generate the one-pager by clicking the "Generate One-Pager" button. Do NOT generate a One-Pager here in the chat.`,
  generateButtonText: "Generate One-Pager",
  approveButtonText: "Approve Draft & Save",
  documentInputs: [], // No previous documents for step 1
  generationPrompt: "Now that we've wrapped up the brainstorming process, can you compile our findings into a clean, comprehensive one-pager? Include the problem, audience, ideal customer, platform, and flow information, such that we could start talking with product & engineering leadership about how this could be built.",
  inputPlaceholder: "Describe your idea...",
  quickStartSuggestions: [
    "An app that tracks my workouts",
    "Marketplace for used kids' gear",
    "A Chrome extension that blocks distracting sites",
  ],
};
