"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/app/types";
import { Terminal, ArrowRight } from 'lucide-react';
import { analytics, getOrCreateClientId } from "@/app/utils/analytics";
import { spikelog } from "@/app/utils/spikelog";

interface ChatInterfaceProps {
  systemPrompt: string;
  initialMessages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  documentInputs?: Record<string, string>;
  initialGreeting?: string;
  stepName?: string;
}

export default function ChatInterface({
  systemPrompt,
  initialMessages,
  onMessagesChange,
  documentInputs,
  initialGreeting,
  stepName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

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
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    if (initialGreeting && initialMessages.length === 0 && messages.length === 0) {
      setMessages([{
        id: Date.now().toString(),
        role: "assistant",
        content: initialGreeting,
      }]);
    }
  }, [initialGreeting, initialMessages.length]);

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
            <div className={`text-[10px] font-mono mb-1 ${
              message.role === "user" ? "text-emerald-500" : "text-zinc-500"
            }`}>
              {message.role === "user" ? "Me" : "AI"}
            </div>

            <div className={`px-4 py-3 text-sm font-mono leading-relaxed whitespace-pre-wrap ${
              message.role === "user"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 pl-0"
            }`}>
              {message.role === "assistant" && <span className="text-zinc-600 mr-2">{'>'}</span>}
              {message.content}
              {message.role === "assistant" && isAssistantPending === message.id && (
                <span
                  className="ml-1 inline-block w-[6px] h-4 bg-zinc-500 animate-pulse align-bottom rounded-sm opacity-80"
                  aria-label="Assistant is typing"
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && lastMessage?.role === "user" && (
          <div className="flex flex-col max-w-[90%] self-start items-start">
            <div className="text-[10px] font-mono mb-1 text-zinc-500">
              AI
            </div>
            <div className="text-zinc-400 pl-0 px-4 py-3 text-sm font-mono leading-relaxed">
              <span className="text-zinc-600 mr-2">{'>'}</span>
              <span
                className="inline-block w-[6px] h-4 bg-zinc-500 animate-pulse align-bottom rounded-sm opacity-80"
                aria-label="Waiting for response"
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative flex gap-3 items-center bg-zinc-900 border border-zinc-800 px-4 py-2 focus-within:border-zinc-600 transition-colors">
          <div className="flex-1 relative">
             <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your ideas here..."
                className="w-full bg-transparent text-sm font-mono text-white focus:outline-none resize-none py-2 placeholder:text-zinc-600"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '24px', maxHeight: '120px' }}
             />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
