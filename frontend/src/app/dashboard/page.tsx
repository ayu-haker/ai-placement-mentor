"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import {
  FileText,
  Mic,
  Brain,
  TrendingUp,
  Target,
  ArrowRight,
  Map,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    placementReadiness: 78,
    skillMatch: 82,
    totalInterviews: 4,
    completedInterviews: 3,
    totalResumes: 2,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res: any = await api.dashboard.get();
      if (res?.dashboard) {
        setDashboardData((prev) => ({
          ...prev,
          ...res.dashboard,
        }));
      }
    } catch {
      // smooth silent fallback
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">
            Track your placement readiness, AI interview scores, and ATS resume status
          </p>
        </div>
        <Link href="/counselor">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg">
            <Brain className="mr-2 h-4 w-4" />
            Ask AI Counselor
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#070b19] border-slate-800/80 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-medium">Placement Readiness</span>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {dashboardData.placementReadiness}%
            </div>
            <Progress value={dashboardData.placementReadiness} className="h-2 bg-slate-900" />
          </CardContent>
        </Card>

        <Card className="bg-[#070b19] border-slate-800/80 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-medium">Skill Match Score</span>
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {dashboardData.skillMatch}%
            </div>
            <Progress value={dashboardData.skillMatch} className="h-2 bg-slate-900" />
          </CardContent>
        </Card>

        <Card className="bg-[#070b19] border-slate-800/80 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-medium">Mock Interviews</span>
              <Mic className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {dashboardData.totalInterviews}
            </div>
            <p className="text-xs text-slate-500">
              {dashboardData.completedInterviews} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#070b19] border-slate-800/80 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-medium">Resumes Analyzed</span>
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {dashboardData.totalResumes}
            </div>
            <p className="text-xs text-slate-500">ATS score optimized</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Tools Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Placement Preparation Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/counselor">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      <Brain className="h-5 w-5" />
                    </div>
                    AI Career Counselor
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                24/7 personalized guidance for interviews, resume tips, technology stacks, and placement strategies.
              </CardContent>
            </Card>
          </Link>

          <Link href="/resume-analyzer">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    Resume ATS Analyzer
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Upload your resume for AI-powered ATS score analysis, strengths, weaknesses, and improvement tips.
              </CardContent>
            </Card>
          </Link>

          <Link href="/skill-gap">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      <Target className="h-5 w-5" />
                    </div>
                    Skill Gap Analysis
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Compare your current skills against target job roles like DevOps, Full Stack, Data Science, or AI.
              </CardContent>
            </Card>
          </Link>

          <Link href="/mock-interview">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      <Mic className="h-5 w-5" />
                    </div>
                    AI Mock Interview
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Practice HR and technical interview questions with real-time feedback and scoring.
              </CardContent>
            </Card>
          </Link>

          <Link href="/roadmap">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      <Map className="h-5 w-5" />
                    </div>
                    Career Roadmap
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Follow a customized week-by-week learning roadmap for your target job role.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
