"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { Paperclip, Send, Loader2, MessageSquare, Bot, User, Trash2 } from "lucide-react";
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-4 px-2">
        <Card className="rounded-xl overflow-hidden border-none shadow-2xl bg-white text-slate-800">
          {/* Blue Top Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <MessageSquare className="h-8 w-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Chat with Your Placement Mentor
                </h1>
                <p className="text-blue-100 text-sm mt-1 font-medium">
                  Get personalized guidance for interviews, resume tips, and career advice
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-white hover:bg-white/20 text-xs border border-white/30"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>

          <CardContent className="p-0 flex flex-col h-[65vh]">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                  <div className="space-y-1">
                    <p className="text-lg md:text-xl font-medium text-slate-700">
                      👋 Hello! I&apos;m your AI Placement Mentor.
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      Ask me anything about:
                    </p>
                  </div>

                  {/* 4 Colored Action Chips from Screenshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full px-4">
                    <button
                      onClick={() => sendChatMessage("Resume tips")}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-lg bg-[#edf4ff] hover:bg-[#dbe9fe] text-[#1e40af] font-medium text-sm transition-all text-left shadow-sm"
                    >
                      <span>📝</span>
                      <span>Resume tips</span>
                    </button>

                    <button
                      onClick={() => sendChatMessage("Interview prep")}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-lg bg-[#edf7ed] hover:bg-[#d8edd8] text-[#166534] font-medium text-sm transition-all text-left shadow-sm"
                    >
                      <span>💼</span>
                      <span>Interview prep</span>
                    </button>

                    <button
                      onClick={() => sendChatMessage("Career guidance")}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-lg bg-[#f7edf9] hover:bg-[#ebd3f5] text-[#6b21a8] font-medium text-sm transition-all text-left shadow-sm"
                    >
                      <span>🎯</span>
                      <span>Career guidance</span>
                    </button>

                    <button
                      onClick={() => sendChatMessage("Skill development")}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-lg bg-[#fefce8] hover:bg-[#fef08a] text-[#854d0e] font-medium text-sm transition-all text-left shadow-sm"
                    >
                      <span>💡</span>
                      <span>Skill development</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3 text-sm items-start",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-5 py-3.5 max-w-[85%] text-slate-800 shadow-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-blue-600 text-white font-medium"
                            : "bg-slate-100 border border-slate-200"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl px-5 py-3.5 bg-slate-100 border border-slate-200 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Bottom Typing Bar */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="relative flex-1 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 text-slate-400 hover:text-slate-600"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                    className="pl-10 pr-4 py-5 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 rounded-lg text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="bg-[#94a3b8] hover:bg-blue-600 text-white font-semibold px-6 py-5 rounded-lg transition-all"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send"
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
