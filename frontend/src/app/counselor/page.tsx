"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { MessageCircle, Send, Loader2, Trash2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

import DashboardLayout from "@/app/dashboard/layout";

export default function CounselorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res: any = await api.counselor.getHistory();
      setMessages(res.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const ensureValidToken = async (): Promise<string | null> => {
      let token = api.getToken();
      if (!token) {
        try {
          const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}@placementmentor.app`;
          const regRes: any = await api.auth.register({
            email: guestEmail,
            password: "GuestPassword123!",
            name: "Guest User",
          });
          if (regRes?.token) {
            token = regRes.token;
            if (token) api.setToken(token);
          }
        } catch {
          // ignore
        }
      }
      return token;
    };

    try {
      await ensureValidToken();
      let res: any;
      try {
        res = await api.counselor.sendMessage(text);
      } catch (firstErr: any) {
        api.clearToken();
        await ensureValidToken();
        res = await api.counselor.sendMessage(text);
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.message,
        timestamp: res.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Counselor chat error:", err);
      const errorText = err?.message || (typeof err === "string" ? err : JSON.stringify(err)) || "Sorry, I encountered an error. Please try again.";
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${errorText}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(input);
  };

  const clearHistory = async () => {
    try {
      await api.counselor.clearHistory();
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Career Counselor</h1>
            <p className="text-muted-foreground">
              Get career guidance, technology recommendations, and placement tips
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Chat
          </Button>
        </div>

        <Card className="h-[65vh] flex flex-col">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Career Counselor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <MessageCircle className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-sm text-muted-foreground">
                      Ask me anything about career guidance, interview prep, technology recommendations, or placement strategies.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
                    {suggestions.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => sendChatMessage(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3 text-sm",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2.5 max-w-[80%]",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <Button type="submit" disabled={!input.trim() || sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

const suggestions = [
  "What skills should I learn for placement?",
  "How should I prepare for HR interviews?",
  "What are the best resources for DSA?",
  "How to improve my resume?",
  "Which technology should I specialize in?",
];
