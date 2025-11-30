"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Code, Copy } from 'lucide-react';

interface DocumentPreviewProps {
  content: string;
  onRegenerate: () => void;
}

export default function DocumentPreview({
  content,
  onRegenerate,
}: DocumentPreviewProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Toolbar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex">
          <button
            onClick={() => setViewMode("rendered")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-all ${
              viewMode === "rendered"
                ? "text-accent border-accent"
                : "text-[#a1a1aa] border-transparent hover:text-[#e4e4e7]"
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-all ${
              viewMode === "raw"
                ? "text-accent border-accent"
                : "text-[#a1a1aa] border-transparent hover:text-[#e4e4e7]"
            }`}
          >
            <Code className="w-3 h-3" />
            Source
          </button>
        </div>

        <button
          onClick={copyToClipboard}
          className="text-[#a1a1aa] hover:text-accent transition-colors"
          title="Copy to Clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-800 border-t border-zinc-800">
        {viewMode === "raw" ? (
          <div className="p-8 font-mono text-[13px] leading-relaxed text-[#e4e4e7] whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <div className="p-8 lg:p-12 max-w-5xl mx-auto">
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}