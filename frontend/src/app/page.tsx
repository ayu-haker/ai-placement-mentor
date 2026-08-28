"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Shield, Users, ArrowRight, MessageCircle, Target, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030612]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030612] text-slate-100 flex flex-col justify-between selection:bg-blue-600/30">
      {/* Header Navbar */}
      <header className="border-b border-slate-800/80 bg-[#050817]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5 font-bold text-xl text-white">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Brain className="h-5 w-5" />
            </div>
            <span>AI Placement Mentor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-sm">
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-900/60 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Placement Preparation
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your AI-Powered{" "}
            <span className="text-blue-500">Placement Mentor</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Master your placement preparation with AI-driven resume analysis, mock interviews,
            skill gap analysis, and personalized career roadmaps.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-600/20">
                Start Your Journey
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/resume-analyzer">
              <div className="rounded-xl border border-slate-800/80 bg-[#070b19] p-8 space-y-4 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                  Smart Resume Analysis
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Get ATS score, keyword analysis, and actionable suggestions to improve your resume.
                </p>
              </div>
            </Link>

            <Link href="/mock-interview">
              <div className="rounded-xl border border-slate-800/80 bg-[#070b19] p-8 space-y-4 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                  AI Mock Interviews
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Practice HR and technical interview questions with real-time AI feedback and scoring.
                </p>
              </div>
            </Link>

            <Link href="/roadmap">
              <div className="rounded-xl border border-slate-800/80 bg-[#070b19] p-8 space-y-4 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                  Career Roadmap
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Follow a customized week-by-week learning plan tailored to your target job role.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        © 2026 AI Placement Mentor. All rights reserved.
      </footer>
    </div>
  );
}
