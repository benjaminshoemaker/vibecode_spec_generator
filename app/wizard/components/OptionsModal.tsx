"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

type Confidence = "weak" | "medium" | "strong";

export type OptionsModalItem = {
  question: string;
  options: string[];
  recommendedIndex: number | null;
  confidence: Confidence;
};

type OptionsModalProps = {
  open: boolean;
  title: string;
  items: OptionsModalItem[];
  onClose: () => void;
  onSubmit: (selectedIndices: Array<number | null>) => void;
};

export function OptionsModal({
  open,
  title,
  items,
  onClose,
  onSubmit,
}: OptionsModalProps) {
  const initialSelections = useMemo(
    () =>
      items.map((item) =>
        typeof item.recommendedIndex === "number" &&
        item.recommendedIndex >= 0 &&
        item.recommendedIndex < item.options.length
          ? item.recommendedIndex
          : null
      ),
    [items]
  );

  const [selectedIndices, setSelectedIndices] = useState<Array<number | null>>(
    initialSelections
  );

  useEffect(() => {
    if (!open) return;
    setSelectedIndices(initialSelections);
  }, [initialSelections, open]);

  if (!open) return null;

  const hasAnySelection = selectedIndices.some(
    (idx) => typeof idx === "number"
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="border-b border-zinc-800 bg-zinc-950/95 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
              Step 1 • Multiple choice
            </div>
            <div className="text-lg font-bold text-white">{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {items.map((item, itemIndex) => (
              <div
                key={`${itemIndex}-${item.question}`}
                className="border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="text-sm text-white mb-3">
                  {item.question}
                </div>
                <div
                  role="group"
                  aria-label={`Options for ${item.question}`}
                  className="grid grid-cols-1 gap-2"
                >
                  {item.options.map((option, optionIndex) => {
                    const isSelected = selectedIndices[itemIndex] === optionIndex;
                    return (
                      <button
                        key={`${optionIndex}-${option}`}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedIndices((prev) => {
                            const next = [...prev];
                            next[itemIndex] =
                              prev[itemIndex] === optionIndex ? null : optionIndex;
                            return next;
                          });
                        }}
                        className={[
                          "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-zinc-300/30",
                          isSelected
                            ? "border-emerald-400/40 bg-emerald-400/10 text-zinc-50"
                            : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900/50 text-zinc-100",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{option}</span>
                          {item.recommendedIndex === optionIndex ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                              <span>Recommended</span>
                              <span className="text-emerald-100/80">
                                {item.confidence}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-800 bg-zinc-950/95 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="text-xs text-zinc-500">
              Select up to one option per question. You can leave any question
              unanswered.
            </div>
            <button
              type="button"
              onClick={() => onSubmit(selectedIndices)}
              disabled={!hasAnySelection}
              className="px-4 py-2 bg-white text-zinc-950 text-sm font-mono hover:bg-zinc-200 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
