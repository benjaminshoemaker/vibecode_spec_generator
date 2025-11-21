"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/app/types";

interface ChatInterfaceProps {
  systemPrompt: string;
  initialMessages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  documentInputs?: Record<string, string>;
  initialGreeting?: string;
}

export default function ChatInterface({
  systemPrompt,
  initialMessages,
  onMessagesChange,
  documentInputs,
  initialGreeting,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({ role: msg.role, content: msg.content })),
          systemPrompt,
          documentInputs,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      setMessages(messagesWithAssistant);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantMessage = { ...assistantMessage, content: assistantMessage.content + chunk };
        setMessages([...updatedMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...updatedMessages, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! Something went wrong. Mind trying again?",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50/50">
      {/* Chat History */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-10">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6 rotate-3">
              <span className="text-4xl">👋</span>
            </div>
            <h3 className="text-2xl font-black text-stone-800 mb-2">Let's chat!</h3>
            <p className="text-stone-500 font-medium max-w-xs">Tell me a bit about what you want to build, and I'll help you figure out the details.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold ${
              message.role === "user" 
                ? "bg-coral-400 text-white" 
                : "bg-teal-400 text-white"
            }`}>
              {message.role === "user" ? "Me" : "AI"}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-base font-medium leading-relaxed ${
              message.role === "user"
                ? "bg-coral-400 text-white rounded-tr-none shadow-sm"
                : "bg-white border-2 border-stone-100 text-stone-700 rounded-tl-none"
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold">AI</div>
            <div className="bg-white border-2 border-stone-100 rounded-3xl rounded-tl-none px-6 py-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t-2 border-stone-100">
        <form onSubmit={handleSubmit} className="relative flex gap-3 items-end">
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
                className="w-full pl-6 pr-12 py-4 bg-stone-50 border-2 border-stone-100 rounded-3xl text-base font-medium text-stone-800 focus:outline-none focus:ring-4 focus:ring-coral-100 focus:border-coral-300 transition-all resize-none min-h-[64px] max-h-[140px] placeholder:text-stone-400"
                rows={1}
                disabled={isLoading}
             />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-[64px] w-[64px] flex items-center justify-center bg-stone-800 hover:bg-black text-white rounded-full transition-all disabled:bg-stone-200 disabled:cursor-not-allowed transform active:scale-95"
          >
            <svg className="w-6 h-6 transform rotate-90 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}