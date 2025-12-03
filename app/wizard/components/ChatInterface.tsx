"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/app/types";
import { ArrowRight } from 'lucide-react';
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
  quickStartSuggestions?: string[];
}

export default function ChatInterface({
  systemPrompt,
  initialMessages,
  onMessagesChange,
  documentInputs,
  initialGreeting,
  stepName,
  placeholder,
  quickStartSuggestions,
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

    const responseStartTime = performance.now();
    let hasTrackedResponseTime = false;
    const trackChatResponseTime = () => {
      if (hasTrackedResponseTime || !stepName) return;
      hasTrackedResponseTime = true;
      spikelog.trackChatResponseTime(
        stepName,
        Math.max(0, Math.round(performance.now() - responseStartTime))
      );
    };

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
        trackChatResponseTime();
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
          trackChatResponseTime();
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
          trackChatResponseTime();
          updateAssistantMessage(assistantMessageId, accumulatedText);
        }
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            accumulatedText += finalChunk;
            chunkCount += finalChunk.length;
            trackChatResponseTime();
            updateAssistantMessage(assistantMessageId, accumulatedText);
          }

          // If nothing streamed, fall back to full text (may include errors)
          if (chunkCount === 0) {
            const fallbackText = await responseClone.text().catch(() => "");
            if (fallbackText) {
              updateAssistantMessage(assistantMessageId, fallbackText);
              trackChatResponseTime();
              // Log assistant message to database
              logChatMessage("assistant", fallbackText);
            } else {
              await runNonStreamingFallback(assistantMessageId, "empty_stream");
            }
          } else {
            trackChatResponseTime();
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
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <svg width="100" height="100" viewBox="0 0 120 120" fill="none" className="mb-4 opacity-70">
              {/* Layer 1 - Input layer (top) */}
              <circle cx="25" cy="20" r="4" fill="#52525b" stroke="#71717a" strokeWidth="1"/>
              <circle cx="45" cy="15" r="3" fill="#52525b" stroke="#71717a" strokeWidth="1"/>
              <circle cx="60" cy="18" r="4" fill="#52525b" stroke="#71717a" strokeWidth="1"/>
              <circle cx="75" cy="15" r="3" fill="#52525b" stroke="#71717a" strokeWidth="1"/>
              <circle cx="95" cy="20" r="4" fill="#52525b" stroke="#71717a" strokeWidth="1"/>

              {/* Layer 2 - Hidden layer 1 */}
              <circle cx="30" cy="40" r="4" fill="#71717a" stroke="#a1a1aa" strokeWidth="1"/>
              <circle cx="50" cy="38" r="5" fill="#71717a" stroke="#a1a1aa" strokeWidth="1"/>
              <circle cx="70" cy="38" r="5" fill="#71717a" stroke="#a1a1aa" strokeWidth="1"/>
              <circle cx="90" cy="40" r="4" fill="#71717a" stroke="#a1a1aa" strokeWidth="1"/>

              {/* Layer 3 - Hidden layer 2 (center, active) */}
              <circle cx="40" cy="58" r="5" fill="#a1a1aa" stroke="#d4d4d8" strokeWidth="1"/>
              <circle cx="60" cy="55" r="7" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2">
                <animate attributeName="r" values="7;8;7" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80" cy="58" r="5" fill="#a1a1aa" stroke="#d4d4d8" strokeWidth="1"/>

              {/* Connections - Layer 1 to 2 */}
              <g stroke="#52525b" strokeWidth="0.5" opacity="0.8">
                <line x1="25" y1="20" x2="30" y2="40"/>
                <line x1="25" y1="20" x2="50" y2="38"/>
                <line x1="45" y1="15" x2="30" y2="40"/>
                <line x1="45" y1="15" x2="50" y2="38"/>
                <line x1="60" y1="18" x2="50" y2="38"/>
                <line x1="60" y1="18" x2="70" y2="38"/>
                <line x1="75" y1="15" x2="70" y2="38"/>
                <line x1="75" y1="15" x2="90" y2="40"/>
                <line x1="95" y1="20" x2="70" y2="38"/>
                <line x1="95" y1="20" x2="90" y2="40"/>
              </g>

              {/* Connections - Layer 2 to 3 */}
              <g stroke="#71717a" strokeWidth="0.75">
                <line x1="30" y1="40" x2="40" y2="58"/>
                <line x1="30" y1="40" x2="60" y2="55"/>
                <line x1="50" y1="38" x2="40" y2="58"/>
                <line x1="50" y1="38" x2="60" y2="55"/>
                <line x1="70" y1="38" x2="60" y2="55"/>
                <line x1="70" y1="38" x2="80" y2="58"/>
                <line x1="90" y1="40" x2="60" y2="55"/>
                <line x1="90" y1="40" x2="80" y2="58"/>
              </g>

              {/* Active signal pulse */}
              <line x1="50" y1="38" x2="60" y2="55" stroke="#f59e0b" strokeWidth="2" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="0.8s" repeatCount="indefinite"/>
              </line>
              <line x1="70" y1="38" x2="60" y2="55" stroke="#f59e0b" strokeWidth="2" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="0.8s" repeatCount="indefinite" begin="0.2s"/>
              </line>

              {/* Output: document blocks */}
              <rect x="30" y="80" width="18" height="22" fill="#3f3f46" stroke="#52525b" strokeWidth="1"/>
              <rect x="51" y="80" width="18" height="22" fill="#3f3f46" stroke="#52525b" strokeWidth="1"/>
              <rect x="72" y="80" width="18" height="22" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1"/>
              {/* Doc lines */}
              <line x1="34" y1="86" x2="44" y2="86" stroke="#71717a" strokeWidth="1"/>
              <line x1="34" y1="90" x2="42" y2="90" stroke="#71717a" strokeWidth="1"/>
              <line x1="55" y1="86" x2="65" y2="86" stroke="#71717a" strokeWidth="1"/>
              <line x1="55" y1="90" x2="63" y2="90" stroke="#71717a" strokeWidth="1"/>
              <line x1="76" y1="86" x2="86" y2="86" stroke="#fbbf24" strokeWidth="1"/>
              <line x1="76" y1="90" x2="84" y2="90" stroke="#fbbf24" strokeWidth="1"/>

              {/* Flow arrow */}
              <path d="M60 65 L60 78" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.5s" repeatCount="indefinite"/>
              </path>
              <path d="M55 73 L60 78 L65 73" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
            </svg>
            <div className="text-sm font-mono text-zinc-500 opacity-50">Ready to bring your idea to life.</div>
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
                <span className="ml-2 inline-flex items-center gap-2 text-accent">
                  <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                </span>
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
              <div className="flex items-center gap-3 text-accent">
                <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                <span className="font-mono text-sm">Processing request...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-950 border-t border-zinc-800">
        {messages.length <= 1 && quickStartSuggestions && quickStartSuggestions.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-3 flex items-center gap-2">
              <span className="text-accent">›</span>
              Quick start suggestions
            </div>
            <div className="flex flex-col gap-2">
              {quickStartSuggestions.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(text)}
                  className="text-left px-4 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-all group"
                >
                  <span className="font-mono text-zinc-700 group-hover:text-accent mr-3">{String(i + 1).padStart(2, '0')}</span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex gap-3 bg-zinc-900 border border-zinc-700 pl-4 pr-1 py-1 focus-within:border-zinc-500 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] transition-all duration-200 min-h-[48px]">
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
                placeholder={placeholder || "Describe your idea..."}
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
              className="w-10 h-10 bg-accent hover:bg-accent-light disabled:bg-zinc-800 flex items-center justify-center transition-all duration-200 flex-shrink-0 active:scale-[0.95]"
            >
              <ArrowRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
