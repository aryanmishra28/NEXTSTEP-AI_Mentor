"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatUI() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // { id, role: 'user'|'assistant', content, ts }
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        message: text,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      };
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const content = res.ok ? data.reply : `Error: ${data?.error || "Request failed"}`;

      const aiMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const errMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Network error. Please try again.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div
        ref={scrollRef}
        className="h-[420px] overflow-y-auto rounded-lg border bg-background p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            Start a conversation about your career. Your messages will appear here.
          </div>) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"} px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  <span>{m.content}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Ask anything about your career..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </Button>
          <Button variant="secondary" onClick={clearChat} disabled={loading}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
