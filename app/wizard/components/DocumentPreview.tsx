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
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6 px-2 pt-6">
        <div className="bg-stone-100 p-1.5 rounded-2xl flex text-sm font-bold">
          <button
            onClick={() => setViewMode("rendered")}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === "rendered"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            📖 Read
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === "raw"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            📝 Code
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {viewMode === "raw" ? (
          <div className="bg-stone-900 text-stone-200 p-8 rounded-3xl font-mono text-sm leading-relaxed whitespace-pre-wrap border-4 border-stone-800">
            {content}
          </div>
        ) : (
          <div className="bg-white px-8 pt-8 pb-8 min-h-full">
            <article className="prose prose-stone prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <div className="mb-8 pb-4 border-b-4 border-stone-100">
                      <h1 className="text-4xl font-black tracking-tight text-stone-900 m-0">{children}</h1>
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="flex items-center gap-3 mt-10 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-coral-200 flex items-center justify-center text-coral-600 font-bold text-lg">#</div>
                      <h2 className="text-2xl font-black text-stone-800 m-0">{children}</h2>
                    </div>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-stone-700 mt-8 mb-3">{children}</h3>
                  ),
                  p: ({ children }) => <p className="mb-6 text-stone-600 leading-relaxed font-medium">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="list-none mb-6 space-y-3 text-stone-600 font-medium pl-0">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                     <li className="flex gap-3 items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mt-2.5 shrink-0"></span>
                        <span>{children}</span>
                     </li>
                  ),
                  code: ({ children }) => (
                    <code className="bg-stone-100 text-teal-600 px-2 py-1 rounded-lg text-sm font-bold border border-stone-200">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-stone-800 text-stone-100 p-6 rounded-3xl mb-8 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="bg-coral-50 border-l-0 border-coral-400 rounded-2xl p-6 my-8 text-coral-800 font-medium italic relative">
                      <span className="absolute top-2 left-2 text-4xl text-coral-200 font-serif leading-none">"</span>
                      <div className="relative z-10">{children}</div>
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-8 border-2 border-stone-100 rounded-2xl">
                      <table className="min-w-full divide-y-2 divide-stone-100">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-stone-50 px-4 py-3 text-left text-sm font-black text-stone-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-stone-600 border-t-2 border-stone-100 font-medium">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}