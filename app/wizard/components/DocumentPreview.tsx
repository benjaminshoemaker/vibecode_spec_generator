"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface DocumentPreviewProps {
  content: string;
  onRegenerate: () => void;
}

export default function DocumentPreview({
  content,
  onRegenerate,
}: DocumentPreviewProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("rendered")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            viewMode === "rendered"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Rendered
        </button>
        <button
          onClick={() => setViewMode("raw")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            viewMode === "raw"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Raw Markdown
        </button>
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "raw" ? (
          <div className="bg-gray-50 p-5 rounded-md font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
            {content}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-900">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-4">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="ml-4">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
                    {children}
                  </pre>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
