"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { Message } from "@/app/types";
import { analytics, getOrCreateClientId } from "@/app/utils/analytics";
import { spikelog } from "@/app/utils/spikelog";
import { useHasHydrated } from "@/app/store";
import { QuestionOptionsWidget } from "./QuestionOptionsWidget";
import { getQuestionInstances } from "@/app/wizard/utils/questionInstances";

interface ChatInterfaceWithOptionsProps {
  systemPrompt: string;
  initialMessages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  documentInputs?: Record<string, string>;
  initialGreeting?: string;
  stepName?: string;
  placeholder?: string;
  quickStartSuggestions?: string[];
}

export default function ChatInterfaceWithOptions({
  systemPrompt,
  initialMessages,
  onMessagesChange,
  documentInputs,
  initialGreeting,
  stepName,
  placeholder,
  quickStartSuggestions,
}: ChatInterfaceWithOptionsProps) {
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
      textarea.style.height = "auto";
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
  const [dismissedInstanceIds, setDismissedInstanceIds] = useState<Set<string>>(
    () => new Set()
  );

  const questionInstances = useMemo(
    () =>
      getQuestionInstances(messages, {
        cap: 5,
        pendingAssistantMessageId: isAssistantPending,
        dismissedInstanceIds,
      }),
    [dismissedInstanceIds, isAssistantPending, messages]
  );

  const questionInstancesByMessageId = useMemo(() => {
    const map = new Map<string, typeof questionInstances>();
    for (const instance of questionInstances) {
      const existing = map.get(instance.messageId);
      if (existing) {
        existing.push(instance);
      } else {
        map.set(instance.messageId, [instance]);
      }
    }
    return map;
  }, [questionInstances]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!hasHydrated) return; // Avoid wiping persisted chat before hydration completes
    onMessagesChange(messages);
  }, [messages, onMessagesChange, hasHydrated]);

  // Initialize messages after hydration completes
  useEffect(() => {
    if (!hasHydrated) return;
    if (messages.length > 0) return;

    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else if (initialGreeting) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: initialGreeting,
        },
      ]);
    }
  }, [hasHydrated, initialMessages, initialGreeting, messages.length]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const updateAssistantMessage = useCallback(
    (assistantId: string, content: string) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantId ? { ...msg, content } : msg))
      );
    },
    []
  );

  const runNonStreamingFallback = useCallback(
    async (
      assistantId: string,
      requestMessages: Message[],
      reason: string,
      trackChatResponseTime: () => void
    ) => {
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
        logChatMessage("assistant", content);
      } catch {
        updateAssistantMessage(
          assistantId,
          "Error: Connection failed. Please retry."
        );
      } finally {
      }
    },
    [documentInputs, logChatMessage, systemPrompt, updateAssistantMessage]
  );

  const sendUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
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

      if (stepName) {
        analytics.trackChatMessage(stepName);
        spikelog.trackChatMessage(stepName);
      }

      logChatMessage("user", userMessage.content);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: requestMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            systemPrompt,
            documentInputs,
          }),
        });

        if (!response.ok) throw new Error("Failed to get response");
        const responseClone = response.clone();
        const assistantMessageId = (Date.now() + 1).toString();

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
          },
        ]);

        if (!response.body) {
          const fallbackText = await responseClone.text();
          if (fallbackText) {
            updateAssistantMessage(assistantMessageId, fallbackText);
            trackChatResponseTime();
            logChatMessage("assistant", fallbackText);
          } else {
            await runNonStreamingFallback(
              assistantMessageId,
              requestMessages,
              "no_response_body",
              trackChatResponseTime
            );
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

            if (chunkCount === 0) {
              const fallbackText = await responseClone.text().catch(() => "");
              if (fallbackText) {
                updateAssistantMessage(assistantMessageId, fallbackText);
                trackChatResponseTime();
                logChatMessage("assistant", fallbackText);
              } else {
                await runNonStreamingFallback(
                  assistantMessageId,
                  requestMessages,
                  "empty_stream",
                  trackChatResponseTime
                );
              }
            } else {
              trackChatResponseTime();
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
    },
    [
      documentInputs,
      isLoading,
      logChatMessage,
      messages,
      runNonStreamingFallback,
      stepName,
      systemPrompt,
      updateAssistantMessage,
    ]
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
      >
        {messages.map((message) => {
          const messageInstances = questionInstancesByMessageId.get(message.id) ?? [];
          return (
            <div
              key={message.id}
              className={`flex flex-col max-w-[90%] ${
                message.role === "user"
                  ? "self-end items-end"
                  : "self-start items-start"
              }`}
            >
              <div
                className={`text-2xs font-mono uppercase tracking-wider mb-1 ${
                  message.role === "user" ? "text-accent" : "text-[#a1a1aa]"
                }`}
              >
                {message.role === "user" ? "You" : "Vibe Scaffold Assistant"}
              </div>

              <div
                className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap w-full ${
                  message.role === "user"
                    ? "bg-accent-glow border border-accent/30 text-[#e4e4e7]"
                    : "bg-zinc-800 border-l-2 border-zinc-700 text-[#a1a1aa]"
                }`}
              >
                {message.content}
                {message.role === "assistant" &&
                  isAssistantPending === message.id && (
                    <span className="ml-2 inline-flex items-center gap-2 text-accent">
                      <svg
                        className="w-4 h-4 animate-spin-slow"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
              </div>

              {message.role === "assistant" && messageInstances.length > 0 ? (
                <div className="w-full">
                  {messageInstances.map((instance) => (
                    <QuestionOptionsWidget
                      key={instance.id}
                      id={instance.id}
                      enabled={!isLoading}
                      questionText={instance.questionText}
                      conversationSummary={instance.conversationSummary}
                      onSelect={(option) => {
                        setDismissedInstanceIds((prev) => {
                          const next = new Set(prev);
                          next.add(instance.id);
                          return next;
                        });
                        void sendUserMessage(option);
                      }}
                      onTypeOwn={() => textareaRef.current?.focus()}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        {isLoading && lastMessage?.role === "user" && (
          <div className="flex flex-col max-w-[90%] self-start items-start">
            <div className="text-2xs font-mono uppercase tracking-wider mb-1 text-[#a1a1aa]">
              Vibe Scaffold Assistant
            </div>
            <div className="bg-zinc-800 border-l-2 border-zinc-700 text-[#a1a1aa] px-4 py-3 text-sm leading-relaxed">
              <div className="flex items-center gap-3 text-accent">
                <svg
                  className="w-5 h-5 animate-spin-slow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-mono text-sm">Processing request...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-zinc-950 border-t border-zinc-800">
        {messages.length <= 1 &&
          quickStartSuggestions &&
          quickStartSuggestions.length > 0 && (
            <div className="mb-4 mt-4">
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
                    <span className="font-mono text-zinc-700 group-hover:text-accent mr-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendUserMessage(input);
          }}
          className="relative flex gap-3 bg-zinc-900 border border-zinc-700 pl-4 pr-1 py-1 focus-within:border-zinc-500 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] transition-all duration-200 min-h-[48px]"
        >
          <div className="flex items-center">
            <span className="text-accent font-mono text-sm select-none">$</span>
          </div>
          <div className="flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendUserMessage(input);
                }
              }}
              placeholder={placeholder || "Describe your idea..."}
              className="w-full bg-transparent text-sm font-mono text-white focus:outline-none resize-none placeholder:text-[#a1a1aa] leading-5 overflow-y-auto py-3"
              rows={1}
              disabled={isLoading}
              style={{ maxHeight: "200px" }}
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
