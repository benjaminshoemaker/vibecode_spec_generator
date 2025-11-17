import { StepConfig } from "@/app/types";

export const step1Config: StepConfig = {
  stepNumber: 1,
  stepName: "One Pager",
  userInstructions:
    "Tell the Assistant about your app idea. It will ask you questions to refine your one-pager. Whenever you feel ready, you can click on 'Generate One-Pager' and it will generate a draft for your review.",
  systemPrompt: `Ask the user one question at a time so that you can develop a one-pager for this idea. Each question should build on the previous ones, and the end goal is a one-pager description of the idea that could be passed to a product manager. We need to gather at least the following:
* What problem does the app solve?
* Who is the ideal user for this app?
* What platform(s) does it live on (mobile web, mobile app, web, CLI)?
* Describe the core user experience, step-by-step.
* What are the must-have features for the MVP?

The user will provide an initial description of their app. Evaluate that, and then ask them one question at a time until you have enough detail to answer the questions above & create a one-pager description of the app. If you can infer an answer from the initial idea input, no need to ask a question about it. Let's do this iteratively. Once we have enough to generate a strong one-pager, tell the user and prompt them to generate the one-pager. Remember, only one question at a time.`,
  generateButtonText: "Generate One-Pager",
  approveButtonText: "Approve Draft & Save",
  documentInputs: [], // No previous documents for step 1
  initialGreeting: "Hello! Tell me about your product idea, and I'll ask you questions to refine it. Whenever you feel like we've gone over enough detail, click 'Generate One-Pager'.",
  generationPrompt: "Now that we’ve wrapped up the brainstorming process, can you compile our findings into a clean, comprehensive one-pager? Include the problem, audience, ideal customer, platform, and flow information, such that we could start talking with product & engineering leadership about how this could be built.",
};
