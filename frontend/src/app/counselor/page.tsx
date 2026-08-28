"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { Bot, User, Send, Trash2, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/app/dashboard/layout";

export default function CounselorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

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
      setMessages([]);
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">AI Career Counselor</h1>
            <p className="text-slate-400 mt-1">
              Get career guidance, technology recommendations, and placement tips
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory} className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
            <Trash2 className="mr-2 h-4 w-4 text-slate-400" />
            Clear Chat
          </Button>
        </div>

        <Card className="h-[72vh] flex flex-col bg-[#070b19] border-slate-800/80 shadow-2xl">
          <CardHeader className="border-b border-slate-800/80 py-3.5 px-6 bg-[#0a0f24]">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-slate-100">
              <Bot className="h-5 w-5 text-blue-500" />
              Career Counselor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
                  <div className="p-4 rounded-full bg-blue-950/40 border border-blue-900/40 text-blue-400">
                    <MessageCircle className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-200">Start a conversation</p>
                    <p className="text-sm text-slate-400 max-w-md mt-1">
                      Ask me anything about career guidance, interview prep, technology recommendations, or placement strategies.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 justify-center max-w-lg pt-4">
                    {suggestions.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-slate-900/80 border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/30 text-slate-300 transition-all"
                        onClick={() => sendChatMessage(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3 text-sm items-start",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-xl px-5 py-3.5 max-w-[85%] text-slate-100 shadow-md leading-relaxed",
                          msg.role === "user"
                            ? "bg-blue-600 text-white font-medium"
                            : "bg-[#0f172a] border border-slate-800 text-slate-200"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-xl px-5 py-3.5 bg-[#0f172a] border border-slate-800 text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="border-t border-slate-800/80 p-4 bg-[#0a0f24]">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                  className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
                />
                <Button type="submit" disabled={!input.trim() || sending} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5">
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
  "Resume tips for software engineer roles",
];
