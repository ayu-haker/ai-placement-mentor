"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AdminStats } from "@/types";
import { Users, FileText, Mic, TrendingUp, Award, Activity } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const res: any = await api.dashboard.getAdmin();
      setStats(res.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          Platform analytics and student progress monitoring
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
        />
        <AdminStatCard
          title="Resumes Analyzed"
          value={stats.totalResumes}
          icon={FileText}
        />
        <AdminStatCard
          title="Interviews Taken"
          value={stats.totalInterviews}
          icon={Mic}
        />
        <AdminStatCard
          title="Avg Score"
          value={`${stats.averageInterviewScore}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSkills.slice(0, 10).map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32 truncate">
                    {skill.name}
                  </span>
                  <Progress
                    value={(skill.count / stats.topSkills[0]?.count) * 100}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {skill.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Engagement Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interview Completion Rate</span>
                  <span className="font-medium">
                    {stats.totalInterviews > 0
                      ? Math.round(
                          (stats.completedInterviews / stats.totalInterviews) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    stats.totalInterviews > 0
                      ? (stats.completedInterviews / stats.totalInterviews) * 100
                      : 0
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Students with Interviews</span>
                  <span className="font-medium">
                    {stats.totalStudents > 0
                      ? Math.round(
                          (stats.studentsWithInterviews / stats.totalStudents) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    stats.totalStudents > 0
                      ? (stats.studentsWithInterviews / stats.totalStudents) * 100
                      : 0
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="border rounded-lg p-3">
                  <p className="text-2xl font-bold">{stats.totalInterviews}</p>
                  <p className="text-xs text-muted-foreground">Total Interviews</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-2xl font-bold">{stats.completedInterviews}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminStatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: any;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
