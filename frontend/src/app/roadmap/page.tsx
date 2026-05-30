"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Roadmap } from "@/types";
import { Map, Loader2, CheckCircle, Circle, Award } from "lucide-react";

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [duration, setDuration] = useState("12");

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const res: any = await api.roadmaps.getAll();
      setRoadmaps(res.roadmaps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setGenerating(true);
    try {
      const res: any = await api.roadmaps.generate({
        targetRole,
        durationWeeks: parseInt(duration),
      });
      setRoadmaps((prev) => [res.roadmap, ...prev]);
      setSelectedRoadmap(res.roadmap);
      setTargetRole("");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeek = async (weekNumber: number, completed: boolean) => {
    if (!selectedRoadmap) return;
    try {
      const res: any = await api.roadmaps.updateProgress(selectedRoadmap.id, {
        weekNumber,
        completed,
      });
      setSelectedRoadmap(res.roadmap);
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === res.roadmap.id ? res.roadmap : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Career Roadmap</h1>
        <p className="text-muted-foreground">
          Generate a personalized weekly learning roadmap for your target role
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Generate New Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateRoadmap} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>Target Role</Label>
              <Input
                placeholder="e.g., Full Stack Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="w-32 space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="16">16 weeks</SelectItem>
                  <SelectItem value="24">24 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={generating || !targetRole.trim()}>
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><Map className="mr-2 h-4 w-4" />Generate</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Your Roadmaps</h2>
          {roadmaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roadmaps generated yet</p>
          ) : (
            roadmaps.map((rm) => (
              <Card
                key={rm.id}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  selectedRoadmap?.id === rm.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedRoadmap(rm)}
              >
                <CardContent className="p-4">
                  <p className="font-medium text-sm">{rm.targetRole}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={rm.isActive ? "success" : "secondary"}>{rm.isActive ? "Active" : "Completed"}</Badge>
                    <span className="text-xs text-muted-foreground">{rm.totalDuration}</span>
                  </div>
                  <Progress value={rm.progress} className="mt-2" />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedRoadmap ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedRoadmap.targetRole}</span>
                    <Badge variant={selectedRoadmap.isActive ? "success" : "secondary"}>
                      {selectedRoadmap.progress}% Complete
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={selectedRoadmap.progress} className="mb-4" />
                  <div className="grid gap-4 sm:grid-cols-3 text-center text-sm">
                    <div>
                      <p className="font-bold text-2xl">{selectedRoadmap.weeks.length}</p>
                      <p className="text-muted-foreground">Total Weeks</p>
                    </div>
                    <div>
                      <p className="font-bold text-2xl">{selectedRoadmap.weeks.filter(w => w.completed).length}</p>
                      <p className="text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <p className="font-bold text-2xl">{selectedRoadmap.milestones.filter(m => m.completed).length}/{selectedRoadmap.milestones.length}</p>
                      <p className="text-muted-foreground">Milestones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRoadmap.milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {m.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${m.completed ? "text-green-500" : ""}`}>{m.title}</p>
                          <p className="text-xs text-muted-foreground">Week {m.week} - {m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Weekly Plan</h2>
                {selectedRoadmap.weeks.map((week) => (
                  <Card key={week.week}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          Week {week.week}: {week.focus}
                        </CardTitle>
                        <Button
                          variant={week.completed ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleWeek(week.week, !week.completed)}
                        >
                          {week.completed ? (
                            <><CheckCircle className="mr-1 h-4 w-4" />Done</>
                          ) : (
                            "Mark Complete"
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Topics</p>
                        <div className="flex flex-wrap gap-2">
                          {week.topics.map((topic) => (
                            <Badge key={topic} variant="secondary">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Tasks</p>
                        <ul className="space-y-1">
                          {week.tasks.map((task, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {week.resources.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Resources</p>
                          <div className="flex flex-wrap gap-2">
                            {week.resources.map((r, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Map className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select a roadmap</p>
                <p className="text-sm text-muted-foreground">Choose a roadmap or generate a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
