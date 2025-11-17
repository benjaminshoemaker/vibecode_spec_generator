import { StepConfig } from "@/app/types";

export const step3Config: StepConfig = {
  stepNumber: 3,
  stepName: "Prompt Plan",
  userInstructions:
    "Now that we have designs & a spec, we are going to create a prompt plan. This will create a series of steps that AI coding tools can execute on, test, and you can manually test, as well as track progress as you go.",
  systemPrompt: `On this step, we're going to generate a step-by-step prompt plan. The user will now optionally provide some new details about their product. Note them, provide feedback, and wait for them to move on to the prompt plan stage. If they don't know how to do that, guide them to click on 'Generate Prompt Plan'`,
  generateButtonText: "Generate Prompt Plan",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["devSpec"], // References previous steps' documents
  initialGreeting: "For this step, I don't need any new information. If you have any tweaks or changes you'd like to make or suggest, feel free to provide them now. When you're ready, click 'Generate Prompt Plan'",
  generationPrompt: `Draft a detailed, step-by-step blueprint for building this project. The blueprint needs to be structured such that we can build components of the app in stages, such that they can be tested and verified manually before moving on to the next component. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. Review the results and make sure that the steps are small enough to be implemented safely with strong testing, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. If manual steps are necessary, note these each as a separate step in the overall series. Prioritize best practices, incremental progress, and early testing, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. The prompt plus manual plan should cover the spec entirely, and result in a complete, working MVP. 

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

Include, after each prompt, a set of todo checkboxes that the AI agents can check off, that capture the changes that the prompt contains. `,
};
