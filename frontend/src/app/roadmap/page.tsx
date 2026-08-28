"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Roadmap, RoadmapWeek } from "@/types";
import { CheckCircle2, Circle, Sparkles, Loader2, Target, BookOpen, Layers, CheckSquare } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const res: any = await api.roadmaps.getAll();
      if (res?.roadmaps && res.roadmaps.length > 0) {
        setRoadmap(res.roadmaps[0]);
      } else {
        setRoadmap(mockRoadmap);
      }
    } catch {
      setRoadmap(mockRoadmap);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (roleToGenerate?: string) => {
    const role = roleToGenerate || targetRole;
    if (!role.trim()) return;

    setGenerating(true);
    try {
      const res: any = await api.roadmaps.generate({
        targetRole: role,
        durationWeeks: 8,
      });
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeekCompletion = async (weekNum: number, currentStatus: boolean) => {
    if (!roadmap) return;

    const updatedWeeks = roadmap.weeks.map((w) =>
      w.week === weekNum ? { ...w, completed: !currentStatus } : w
    );

    const completedCount = updatedWeeks.filter((w) => w.completed).length;
    const newProgress = Math.round((completedCount / updatedWeeks.length) * 100);

    const updatedRoadmap = {
      ...roadmap,
      weeks: updatedWeeks,
      progress: newProgress,
    };

    setRoadmap(updatedRoadmap);

    try {
      const rId = roadmap.id || (roadmap as any)._id;
      if (rId) {
        await api.roadmaps.updateProgress(rId, {
          weekNumber: weekNum,
          completed: !currentStatus,
        });
      }
    } catch (err) {
      console.error(err);
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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Interactive AI Career Roadmap</h1>
            <p className="text-slate-400 mt-1">
              Personalized week-by-week learning goals & milestone tracking for {roadmap?.targetRole || "Software Engineer"}
            </p>
          </div>
          <Badge className="bg-blue-950/80 text-blue-400 border-blue-900 px-3.5 py-1.5 text-sm font-semibold self-start md:self-auto">
            Target: {roadmap?.targetRole || "Full Stack Engineer"}
          </Badge>
        </div>

        {/* AI Custom Role Generator Card */}
        <Card className="bg-[#070b19] border-slate-800/80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Generate Custom AI Roadmap for Any Target Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                placeholder="Enter target role e.g., DevOps Engineer, Data Scientist, AI Engineer, Full Stack..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 flex-1 py-5 focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={!targetRole.trim() || generating}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-5 px-6 shrink-0"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {generating ? "Generating AI Plan..." : "Generate AI Roadmap"}
              </Button>
            </form>

            {/* Target Role Quick Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 font-semibold mr-1">Popular Roles:</span>
              {[
                "🚀 Full Stack Developer",
                "⚙️ DevOps Engineer",
                "📊 Data Scientist",
                "🤖 AI/ML Engineer",
                "🔐 Cybersecurity Analyst",
              ].map((roleChip) => {
                const cleanRole = roleChip.replace(/^[^\s]+\s*/, "");
                return (
                  <button
                    key={roleChip}
                    type="button"
                    onClick={() => {
                      setTargetRole(cleanRole);
                      handleGenerate(cleanRole);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-900 hover:bg-blue-950/60 hover:text-blue-300 text-slate-300 border border-slate-800 transition-all"
                  >
                    {roleChip}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress Banner */}
        <Card className="bg-[#070b19] border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Overall Learning Progress
              </span>
              <span className="text-2xl font-extrabold text-blue-400">
                {roadmap?.progress || 0}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={roadmap?.progress || 0} className="h-3 bg-slate-900" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Duration: {roadmap?.totalDuration || "8 Weeks"}</span>
              <span>
                {roadmap?.weeks?.filter((w) => w.completed).length || 0} of{" "}
                {roadmap?.weeks?.length || 8} weeks completed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Timeline - Interactive Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              Week-by-Week Learning Roadmap
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              💡 Click any week checkbox to mark it complete!
            </span>
          </div>

          <div className="space-y-4">
            {(roadmap?.weeks || mockRoadmap.weeks).map((week: RoadmapWeek, i: number) => (
              <Card
                key={i}
                className={`bg-[#070b19] border transition-all ${
                  week.completed
                    ? "border-emerald-800/60 bg-emerald-950/10"
                    : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Top Bar: Clickable Checkbox & Week Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div
                      onClick={() => toggleWeekCompletion(week.week, week.completed)}
                      className="flex items-start gap-3.5 cursor-pointer group flex-1"
                    >
                      {week.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-600 shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
                      )}
                      <div>
                        <h3 className="font-bold text-base md:text-lg text-slate-100 group-hover:text-blue-300 transition-colors">
                          Week {week.week}: {week.focus}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Click to toggle completion state
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        week.completed
                          ? "border-emerald-800 text-emerald-400 bg-emerald-950/60 font-semibold"
                          : "border-slate-800 text-slate-400 bg-slate-900/60"
                      }
                    >
                      {week.completed ? "Completed 🟢" : "In Progress ⚪"}
                    </Badge>
                  </div>

                  {/* Key Learning Topics Badges */}
                  {week.topics && week.topics.length > 0 && (
                    <div className="pl-9 space-y-2">
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                        Key Topics to Learn:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {week.topics.map((t, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-slate-900 text-slate-300 border border-slate-800 text-xs px-2.5 py-1"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks List if present */}
                  {week.tasks && week.tasks.length > 0 && (
                    <div className="pl-9 space-y-2 pt-1 border-t border-slate-800/40">
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                        Actionable Tasks:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {week.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-center gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
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
  totalDuration: "8 Weeks",
  progress: 38,
  isActive: true,
  startedAt: new Date().toISOString(),
  weeks: [
    { week: 1, focus: "Data Structures & Algorithms Basics", topics: ["Arrays", "Strings", "Big-O Notation", "Hash Maps"], tasks: ["Solve 10 LeetCode Easy problems", "Understand Time & Space complexity"], resources: ["LeetCode"], completed: true },
    { week: 2, focus: "Advanced Problem Solving & Pointers", topics: ["Two Pointers", "Sliding Window", "Linked Lists", "Stacks & Queues"], tasks: ["Implement Custom LinkedList", "Solve 5 Medium questions"], resources: ["GeeksforGeeks"], completed: true },
    { week: 3, focus: "System Design & REST API Architecture", topics: ["REST Principles", "Database Design", "Scalability", "Redis Caching"], tasks: ["Design RESTful API for E-commerce"], resources: ["MDN Web Docs"], completed: true },
    { week: 4, focus: "Database Persistence & Relational Schema", topics: ["PostgreSQL", "MongoDB", "Indexing", "ORMs"], tasks: ["Write SQL queries and indexes"], resources: ["Postgres Tutorial"], completed: false },
    { week: 5, focus: "Authentication, JWT & Security", topics: ["JWT Tokens", "OAuth2", "CORS", "Rate Limiting"], tasks: ["Implement secure Auth middleware"], resources: ["OWASP Guide"], completed: false },
    { week: 6, focus: "Docker Containerization & CI/CD", topics: ["Dockerfiles", "Docker Compose", "GitHub Actions", "Cloud Deployment"], tasks: ["Deploy full stack app to Render/Vercel"], resources: ["Docker Docs"], completed: false },
    { week: 7, focus: "Full Stack Capstone Portfolio Project", topics: ["WebSockets", "Real-time Chat", "Performance Monitoring"], tasks: ["Complete Capstone Project and push to GitHub"], resources: ["GitHub"], completed: false },
    { week: 8, focus: "Placement Prep & System Design Interviews", topics: ["System Design Basics", "STAR Behavioral Technique", "ATS Resume Fine-Tuning"], tasks: ["Conduct 2 Mock Interviews"], resources: ["InterviewBit"], completed: false },
  ],
  milestones: [],
};
