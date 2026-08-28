"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Roadmap } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const res: any = await api.roadmaps.getAll();
      setRoadmap(res.roadmaps?.[0] || mockRoadmap);
    } catch (err) {
      setRoadmap(mockRoadmap);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Career Roadmap</h1>
            <p className="text-slate-400 mt-1">
              Your personalized step-by-step learning journey for {roadmap?.targetRole || "Software Engineer"}
            </p>
          </div>
          <Badge className="bg-blue-950/80 text-blue-400 border-blue-900 px-3 py-1 text-sm font-semibold">
            Target: {roadmap?.targetRole || "Full Stack Engineer"}
          </Badge>
        </div>

        {/* Progress Banner */}
        <Card className="bg-[#070b19] border-slate-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white">
              <span>Roadmap Completion</span>
              <span className="text-2xl font-bold text-blue-400">{roadmap?.progress || 45}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={roadmap?.progress || 45} className="h-3 bg-slate-900" />
            <p className="text-xs text-slate-400">Total duration: {roadmap?.totalDuration || "12 Weeks"}</p>
          </CardContent>
        </Card>

        {/* Weekly Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Weekly Milestones</h2>
          <div className="space-y-4">
            {(roadmap?.weeks || mockRoadmap.weeks).map((week, i) => (
              <Card key={i} className="bg-[#070b19] border-slate-800/80">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {week.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-600 shrink-0" />
                      )}
                      <h3 className="font-bold text-base text-slate-100">
                        Week {week.week}: {week.focus}
                      </h3>
                    </div>
                    <Badge variant="outline" className={week.completed ? "border-emerald-800 text-emerald-400 bg-emerald-950/40" : "border-slate-800 text-slate-400"}>
                      {week.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  {week.topics && (
                    <div className="pl-8 flex flex-wrap gap-2 pt-1">
                      {week.topics.map((t, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-900 text-slate-300 border-slate-800 text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const mockRoadmap: Roadmap = {
  id: "1",
  userId: "guest",
  targetRole: "Full Stack Software Engineer",
  totalDuration: "12 Weeks",
  progress: 45,
  isActive: true,
  startedAt: new Date().toISOString(),
  weeks: [
    { week: 1, focus: "Data Structures & Algorithms Basics", topics: ["Arrays", "Strings", "Big-O", "Hash Maps"], tasks: [], resources: [], completed: true },
    { week: 2, focus: "Advanced Problem Solving", topics: ["Two Pointers", "Sliding Window", "Linked Lists", "Stacks & Queues"], tasks: [], resources: [], completed: true },
    { week: 3, focus: "System Design & REST APIs", topics: ["REST", "Database Design", "Scalability", "Caching"], tasks: [], resources: [], completed: false },
    { week: 4, focus: "Mock Interview & Portfolio Prep", topics: ["HR Practice", "Architecture", "GitHub Showcase"], tasks: [], resources: [], completed: false },
  ],
  milestones: [],
};
