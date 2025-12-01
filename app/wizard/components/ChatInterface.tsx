"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/app/types";
import { Terminal, ArrowRight } from 'lucide-react';
import { analytics, getOrCreateClientId } from "@/app/utils/analytics";
import { spikelog } from "@/app/utils/spikelog";
import { useHasHydrated } from "@/app/store";

interface ChatInterfaceProps {
  systemPrompt: string;
  initialMessages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  documentInputs?: Record<string, string>;
  initialGreeting?: string;
  stepName?: string;
  placeholder?: string;
}

export default function ChatInterface({
  systemPrompt,
  initialMessages,
  onMessagesChange,
  documentInputs,
  initialGreeting,
  stepName,
  placeholder,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasHydrated = useHasHydrated();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Auto-resize textarea
  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea(textareaRef.current);
  }, [input, autoResizeTextarea]);

  const logChatMessage = async (role: "user" | "assistant", content: string) => {
    try {
      const clientId = getOrCreateClientId();
      await fetch("/api/log-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          sessionId: sessionIdRef.current,
          stepName,
          role,
          content,
        }),
      });
    } catch (error) {
      // Fire-and-forget: don't block user experience
      console.error("Failed to log chat message:", error);
    }
  };
  const lastMessage = messages[messages.length - 1];
  const isAssistantPending =
    isLoading && lastMessage?.role === "assistant" ? lastMessage.id : null;

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!hasHydrated) return; // Avoid wiping persisted chat before hydration completes
    onMessagesChange(messages);
  }, [messages, onMessagesChange, hasHydrated]);

  // Initialize messages after hydration completes
  useEffect(() => {
    if (!hasHydrated) return;

    // Only initialize if messages haven't been set yet
    if (messages.length > 0) return;

    if (initialMessages.length > 0) {
      // Restore persisted messages
      setMessages(initialMessages);
    } else if (initialGreeting) {
      // Show greeting for fresh sessions
      setMessages([{
        id: Date.now().toString(),
        role: "assistant",
        content: initialGreeting,
      }]);
    }
  }, [hasHydrated, initialMessages, initialGreeting]);

  // Auto-focus input on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready and any transitions complete
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const requestMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Track chat message submission
    if (stepName) {
      analytics.trackChatMessage(stepName);
      spikelog.trackChatMessage(stepName); // #13
    }

    // Log user message to database
    logChatMessage("user", userMessage.content);

    const updateAssistantMessage = (assistantId: string, content: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content,
              }
            : msg
        )
      );
    };

    const runNonStreamingFallback = async (assistantId: string, reason: string) => {
      // Track streaming fallback (#3)
      spikelog.trackStreamingFallback(reason);

      try {
        const fallbackResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: requestMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            systemPrompt,
            documentInputs,
            stream: false,
          }),
        });

        const fallbackText = await fallbackResponse.text();
        const content =
          fallbackText ||
          "No response received. Please check your API key and try again.";
        updateAssistantMessage(assistantId, content);
        // Log assistant message to database
        logChatMessage("assistant", content);
      } catch (err) {
        updateAssistantMessage(
          assistantId,
          "Error: Connection failed. Please retry."
        );
      }
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages.map((msg) => ({ role: msg.role, content: msg.content })),
          systemPrompt,
          documentInputs,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const responseClone = response.clone();
      const assistantMessageId = (Date.now() + 1).toString();

      // Seed the assistant message bubble immediately
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      // Fallback for environments where the response body isn't streamable
      if (!response.body) {
        const fallbackText = await responseClone.text();
        if (fallbackText) {
          updateAssistantMessage(assistantMessageId, fallbackText);
          // Log assistant message to database
          logChatMessage("assistant", fallbackText);
        } else {
          await runNonStreamingFallback(assistantMessageId, "no_response_body");
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;
          chunkCount += chunk.length;
          updateAssistantMessage(assistantMessageId, accumulatedText);
        }
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            accumulatedText += finalChunk;
            chunkCount += finalChunk.length;
            updateAssistantMessage(assistantMessageId, accumulatedText);
          }

          // If nothing streamed, fall back to full text (may include errors)
          if (chunkCount === 0) {
            const fallbackText = await responseClone.text().catch(() => "");
            if (fallbackText) {
              updateAssistantMessage(assistantMessageId, fallbackText);
              // Log assistant message to database
              logChatMessage("assistant", fallbackText);
            } else {
              await runNonStreamingFallback(assistantMessageId, "empty_stream");
            }
          } else {
            // Log assistant message to database after streaming completes
            logChatMessage("assistant", accumulatedText);
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Error: Connection failed. Please retry.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Chat History */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Terminal className="w-12 h-12 text-zinc-600 mb-4" />
            <div className="text-sm font-mono text-zinc-500">TERMINAL SESSION READY</div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col max-w-[90%] ${message.role === "user" ? "self-end items-end" : "self-start items-start"}`}
          >
            <div className={`text-2xs font-mono uppercase tracking-wider mb-1 ${
              message.role === "user" ? "text-accent" : "text-[#a1a1aa]"
            }`}>
              {message.role === "user" ? "You" : "Vibe Scaffold Assistant"}
            </div>

            <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              message.role === "user"
                ? "bg-accent-glow border border-accent/30 text-[#e4e4e7]"
                : "bg-zinc-800 border-l-2 border-zinc-700 text-[#a1a1aa]"
            }`}>
              {message.content}
              {message.role === "assistant" && isAssistantPending === message.id && (
                <span
                  className="ml-1 inline-block w-[6px] h-4 bg-accent animate-pulse align-bottom rounded-sm opacity-80"
                  aria-label="Assistant is typing"
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && lastMessage?.role === "user" && (
          <div className="flex flex-col max-w-[90%] self-start items-start">
            <div className="text-2xs font-mono uppercase tracking-wider mb-1 text-[#a1a1aa]">
              Vibe Scaffold Assistant
            </div>
            <div className="bg-zinc-800 border-l-2 border-zinc-700 text-[#a1a1aa] px-4 py-3 text-sm leading-relaxed">
              <span
                className="inline-block w-[6px] h-4 bg-accent animate-pulse align-bottom rounded-sm opacity-80"
                aria-label="Waiting for response"
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative flex gap-3 bg-zinc-900 border border-zinc-700 pl-4 pr-1 py-1 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] transition-all min-h-[48px]">
          <div className="flex items-center">
            <span className="text-accent font-mono text-sm select-none">$</span>
          </div>
          <div className="flex-1 flex items-center">
             <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={placeholder || "Describe your requirements..."}
                className="w-full bg-transparent text-sm font-mono text-white focus:outline-none resize-none placeholder:text-[#a1a1aa] leading-5 overflow-y-auto py-3"
                rows={1}
                disabled={isLoading}
                style={{ maxHeight: '200px' }}
             />
          </div>

          <div className="flex items-center">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-accent hover:bg-accent-light disabled:bg-zinc-800 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
