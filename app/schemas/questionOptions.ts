import { z } from "zod";

const forbiddenOptionSet = new Set([
  "other",
  "none of the above",
  "something else",
]);

const optionSchema = z
  .string()
  .trim()
  .min(3, "Option must be at least 3 characters long");

export const questionOptionsSchema = z
  .object({
    reasoning: z.string().trim().min(1),
    options: z.array(optionSchema).min(3).max(6),
    recommendedIndex: z.number().int().nonnegative().nullable(),
    confidence: z.enum(["weak", "medium", "strong"]),
  })
  .superRefine((data, ctx) => {
    const normalizedOptions = data.options.map((option) =>
      option.trim().toLowerCase()
    );

    const seen = new Set<string>();
    for (const normalizedOption of normalizedOptions) {
      if (seen.has(normalizedOption)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Options must be distinct",
          path: ["options"],
        });
        break;
      }
      seen.add(normalizedOption);
    }

    const forbidden = normalizedOptions.find((option) =>
      forbiddenOptionSet.has(option)
    );
    if (forbidden) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options must not include generic choices",
        path: ["options"],
      });
    }

    if (data.recommendedIndex !== null) {
      if (data.recommendedIndex < 0 || data.recommendedIndex >= data.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "recommendedIndex must be within options bounds",
          path: ["recommendedIndex"],
        });
      }
    }
  });

export type QuestionOptions = z.infer<typeof questionOptionsSchema>;

