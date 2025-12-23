type FormatSelectionsArgs = {
  questions: string[];
  optionsByQuestion: string[][];
  selectedIndices: Array<number | null>;
};

function normalizeQuestionLabel(question: string) {
  return question.trim().replace(/\?+$/, "").trim();
}

export function formatSelectionsAsMessage({
  questions,
  optionsByQuestion,
  selectedIndices,
}: FormatSelectionsArgs): string | null {
  const answered: Array<{ label: string; option: string }> = [];

  for (let i = 0; i < questions.length; i++) {
    const selectedIndex = selectedIndices[i];
    if (typeof selectedIndex !== "number") continue;

    const option = optionsByQuestion[i]?.[selectedIndex];
    if (typeof option !== "string" || option.trim().length === 0) continue;

    const label = normalizeQuestionLabel(questions[i] ?? "");
    if (!label) continue;

    answered.push({ label, option: option.trim() });
  }

  if (answered.length === 0) return null;

  if (answered.length === 1) {
    const only = answered[0]!;
    return `For "${only.label}": ${only.option}.`;
  }

  const lines = ["Here are my answers:"];
  for (const item of answered) {
    lines.push(`- ${item.label}: ${item.option}`);
  }
  return lines.join("\n");
}

