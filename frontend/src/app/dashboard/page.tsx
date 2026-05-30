"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { DashboardData } from "@/types";
import {
  FileText,
  Mic,
  Brain,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      setData(res.dashboard);
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

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your placement preparation progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Placement Readiness"
          value={`${data.placementReadiness}%`}
          icon={TrendingUp}
          progress={data.placementReadiness}
        />
        <StatCard
          title="Skill Match"
          value={`${data.skillMatch}%`}
          icon={Target}
          progress={data.skillMatch}
        />
        <StatCard
          title="Interviews"
          value={data.totalInterviews.toString()}
          icon={Mic}
          subtitle={`${data.completedInterviews} completed`}
        />
        <StatCard
          title="Resumes"
          value={data.totalResumes.toString()}
          icon={FileText}
          subtitle="analyzed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Skills Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your Skills ({data.currentSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.currentSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {data.currentSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet. Upload your resume to get started.
                    </p>
                  )}
                </div>
              </div>
              {data.strengths.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Strengths</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {data.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activities. Start by analyzing your resume!
                </p>
              ) : (
                data.activities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <p>{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                    {activity.score && (
                      <Badge variant="outline">{activity.score}%</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.activeRoadmap && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Roadmap</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.roadmapTarget}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={data.roadmapProgress} />
                <p className="text-sm text-muted-foreground">
                  {data.roadmapProgress}% complete
                </p>
                <Link href="/roadmap">
                  <Button variant="outline" size="sm">
                    View Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {data.recentInterviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentInterviews.slice(0, 3).map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium capitalize">{interview.mode} Interview</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(interview.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        interview.overallScore >= 70
                          ? "success"
                          : interview.overallScore >= 40
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {interview.overallScore || "N/A"}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  progress,
  subtitle,
}: {
  title: string;
  value: string;
  icon: any;
  progress?: number;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-4" />
        )}
      </CardContent>
    </Card>
  );
}
