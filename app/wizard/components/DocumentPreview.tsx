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
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("rendered")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition-all ${
              viewMode === "rendered"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition-all ${
              viewMode === "raw"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Code className="w-3 h-3" />
            Source
          </button>
        </div>
        
        <button 
          onClick={copyToClipboard}
          className="text-zinc-500 hover:text-white transition-colors"
          title="Copy to Clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950">
        {viewMode === "raw" ? (
          <div className="p-8 font-mono text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap">
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