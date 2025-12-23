import React from "react";

type Confidence = "weak" | "medium" | "strong";

type OptionButtonsProps = {
  options: string[];
  isLoading: boolean;
  recommendedIndex: number | null;
  confidence: Confidence | null;
  onSelect: (option: string) => void;
  onTypeOwn: () => void;
};

function formatConfidence(confidence: Confidence) {
  if (confidence === "weak") return "weak";
  if (confidence === "medium") return "medium";
  return "strong";
}

export function OptionButtons({
  options,
  isLoading,
  recommendedIndex,
  confidence,
  onSelect,
  onTypeOwn,
}: OptionButtonsProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Generating options"
        className="mt-3 space-y-2"
      >
        <div className="h-9 w-full rounded-md bg-zinc-900/60 animate-pulse" />
        <div className="h-9 w-full rounded-md bg-zinc-900/60 animate-pulse" />
        <div className="h-9 w-5/6 rounded-md bg-zinc-900/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div role="group" aria-label="Suggested options" className="space-y-2">
        {options.map((option, index) => {
          const isRecommended =
            typeof recommendedIndex === "number" && recommendedIndex === index;

          return (
            <button
              key={`${index}-${option}`}
              type="button"
              data-recommended={isRecommended ? "true" : undefined}
              onClick={() => onSelect(option)}
              className={[
                "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-zinc-300/30",
                isRecommended
                  ? "border-emerald-400/40 bg-emerald-400/10 text-zinc-50"
                  : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900/50 text-zinc-100",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{option}</span>
                {isRecommended && confidence ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                    <span>Recommended</span>
                    <span className="text-emerald-100/80">
                      {formatConfidence(confidence)}
                    </span>
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onTypeOwn}
        className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
      >
        or type your own response
      </button>
    </div>
  );
}

