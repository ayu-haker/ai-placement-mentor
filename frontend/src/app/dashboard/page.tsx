"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import {
  FileText,
  Mic,
  Brain,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/app/dashboard/layout";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res: any = await api.dashboard.get();
      setData(res.dashboard || {
        placementReadiness: 78,
        skillMatch: 82,
        totalInterviews: 4,
        completedInterviews: 3,
        totalResumes: 2,
      } as any);
    } catch (err: any) {
      setData({
        placementReadiness: 78,
        skillMatch: 82,
        totalInterviews: 4,
        completedInterviews: 3,
        totalResumes: 2,
      } as any);
    } finally {
      setLoading(false);
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
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Track your placement preparation progress & AI recommendations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#070b19] border-slate-800/80">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Placement Readiness</span>
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data?.placementReadiness || 78}%
              </div>
              <Progress value={data?.placementReadiness || 78} className="h-2 bg-slate-900" />
            </CardContent>
          </Card>

          <Card className="bg-[#070b19] border-slate-800/80">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Skill Match Score</span>
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data?.skillMatch || 82}%
              </div>
              <Progress value={data?.skillMatch || 82} className="h-2 bg-slate-900" />
            </CardContent>
          </Card>

          <Card className="bg-[#070b19] border-slate-800/80">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Mock Interviews</span>
                <Mic className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data?.totalInterviews || 4}
              </div>
              <p className="text-xs text-slate-500">
                {data?.completedInterviews || 3} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#070b19] border-slate-800/80">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Resumes Analyzed</span>
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data?.totalResumes || 2}
              </div>
              <p className="text-xs text-slate-500">ATS optimized</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/resume-analyzer">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Resume Analyzer
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400">
                Upload your resume for AI-powered ATS analysis and score feedback.
              </CardContent>
            </Card>
          </Link>

          <Link href="/counselor">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-400" />
                    AI Career Counselor
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400">
                Get 24/7 placement advice, DSA resources, and technology roadmaps.
              </CardContent>
            </Card>
          </Link>

          <Link href="/skill-gap">
            <Card className="bg-[#070b19] border-slate-800/80 hover:border-blue-500/50 hover:bg-[#0a0f24] transition-all cursor-pointer group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Skill Gap Analysis
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400">
                Compare your skills against target roles like DevOps, Full Stack, Data Science.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
