"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Code, Sparkles, ArrowRight } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function MockInterviewPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Mock Interview</h1>
          <p className="text-slate-400 mt-1">
            Practice with AI-generated interview questions tailored to your skills
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group"
            onClick={() => router.push("/mock-interview/hr")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <Mic className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">HR Interview</CardTitle>
              <CardDescription className="text-slate-400">
                Practice behavioral and HR interview questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Communication skills assessment
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Behavioral STAR technique questions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Leadership & teamwork scenarios
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Detailed performance feedback
                </li>
              </ul>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                Start HR Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group"
            onClick={() => router.push("/mock-interview/technical")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <Code className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">Technical Interview</CardTitle>
              <CardDescription className="text-slate-400">
                Practice coding and technical domain questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Data Structures & Algorithms
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  System Design & OOP concepts
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Language-specific questions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Code optimization feedback
                </li>
              </ul>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                Start Technical Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
