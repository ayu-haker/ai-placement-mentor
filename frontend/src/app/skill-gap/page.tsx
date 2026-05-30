"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { SkillAssessment } from "@/types";
import { Brain, Target, BookOpen, ExternalLink, Loader2 } from "lucide-react";

export default function SkillGapPage() {
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<SkillAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const res: any = await api.skills.getAll();
      setAssessments(res.assessments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setAnalyzing(true);
    try {
      const res: any = await api.skills.analyze({ targetRole });
      setAssessments((prev) => [res.assessment, ...prev]);
      setSelectedAssessment(res.assessment);
      setTargetRole("");
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
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
        <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
        <p className="text-muted-foreground">
          Analyze your skills against target roles and get personalized recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analyze Your Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={analyzeSkills} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g., Full Stack Developer, Data Scientist"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={analyzing || !targetRole.trim()}>
              {analyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
              ) : (
                <><Brain className="mr-2 h-4 w-4" />Analyze</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Previous Analyses</h2>
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No analyses yet</p>
          ) : (
            assessments.map((a) => (
              <Card
                key={a.id}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  selectedAssessment?.id === a.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedAssessment(a)}
              >
                <CardContent className="p-4">
                  <p className="font-medium text-sm">{a.targetRole}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={a.matchPercentage >= 70 ? "success" : a.matchPercentage >= 40 ? "warning" : "destructive"}>
                      {a.matchPercentage}% match
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(a.assessmentDate)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedAssessment ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAssessment.targetRole} - Match Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-5xl font-bold text-primary">{selectedAssessment.matchPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Overall Match</p>
                    <Progress value={selectedAssessment.matchPercentage} className="w-64 mx-auto" />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Badge variant="success" className="w-2 h-2 p-0 rounded-full" />
                        Your Skills ({selectedAssessment.currentSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssessment.currentSkills.map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full" />
                        Missing Skills ({selectedAssessment.missingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssessment.missingSkills.map((s) => (
                          <Badge key={s} variant="destructive">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssessment.requiredSkills.map((s) => (
                      <Badge key={s} variant={selectedAssessment.currentSkills.includes(s) ? "success" : "destructive"}>
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAssessment.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {selectedAssessment.resources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {selectedAssessment.resources.map((r, i) => (
                        <div key={i} className="border rounded-lg p-3 space-y-2">
                          <p className="font-medium text-sm">{r.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{r.type}</Badge>
                            <span className="text-xs text-muted-foreground">{r.platform}</span>
                          </div>
                          {r.url && r.url !== `search:${r.title}` && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              View Resource <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select an analysis</p>
                <p className="text-sm text-muted-foreground">Choose a previous analysis or run a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
