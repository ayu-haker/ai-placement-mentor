"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { SkillAssessment } from "@/types";
import { Target, Search, Lightbulb, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function SkillGapPage() {
  const [analyses, setAnalyses] = useState<SkillAssessment[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SkillAssessment | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const res: any = await api.skills.getAll();
      setAnalyses(res.assessments || res.analyses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || analyzing) return;

    setAnalyzing(true);
    try {
      const res: any = await api.skills.analyze({ targetRole });
      const newAnalysis = res.assessment || res.analysis || res;
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelectedAnalysis(newAnalysis);
      setTargetRole("");
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Skill Gap Analysis</h1>
          <p className="text-slate-400 mt-1">
            Analyze your skills against target roles and get personalized recommendations
          </p>
        </div>

        {/* Search / Analyze Input Card */}
        <Card className="bg-[#070b19] border-slate-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-100">
              <Target className="h-5 w-5 text-blue-500" />
              Analyze Your Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="flex gap-3">
              <Input
                placeholder="e.g., Full Stack Developer, Data Scientist, devops"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={analyzing}
                className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={!targetRole.trim() || analyzing}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Analyses & Detail Split View */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Previous Analyses */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-bold text-white">Previous Analyses</h2>
            {analyses.length === 0 ? (
              <Card className="bg-[#070b19] border-slate-800/80">
                <CardContent className="py-8 text-center text-slate-400 text-sm">
                  No skill analyses yet. Enter a target role above to begin!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => {
                  const aId = analysis.id || (analysis as any)._id;
                  const isSelected = selectedAnalysis?.id === aId || (selectedAnalysis as any)?._id === aId;
                  return (
                    <Card
                      key={aId}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/30"
                          : "bg-[#070b19] border-slate-800/80 hover:border-slate-700"
                      }`}
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-slate-200 capitalize">
                            {analysis.targetRole}
                          </p>
                          <span className="text-xs text-slate-500">
                            {formatDate(analysis.assessmentDate || (analysis as any).createdAt)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge
                            className={
                              analysis.matchPercentage >= 70
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                                : "bg-red-950/80 text-red-400 border-red-900"
                            }
                          >
                            {analysis.matchPercentage}% match
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Match Analysis View */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <div className="space-y-6">
                {/* Score Banner */}
                <Card className="bg-[#070b19] border-slate-800/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-white capitalize">
                      {selectedAnalysis.targetRole} - Match Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-blue-400">
                        {selectedAnalysis.matchPercentage}%
                      </span>
                      <span className="text-sm text-slate-400 font-medium">Overall Match</span>
                    </div>
                    <Progress value={selectedAnalysis.matchPercentage} className="h-3 bg-slate-900" />
                  </CardContent>
                </Card>

                {/* Acquired vs Missing Skills */}
                <Card className="bg-[#070b19] border-slate-800/80">
                  <CardContent className="p-6 space-y-6">
                    {/* Your Skills */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
                        Your Skills ({selectedAnalysis.currentSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.currentSkills?.map((skill: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-slate-900 text-slate-200 border-slate-800 px-3 py-1 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                        Missing Skills ({selectedAnalysis.missingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.missingSkills?.map((skill: string, i: number) => (
                          <Badge
                            key={i}
                            className="bg-red-950/80 text-red-300 border-red-900 px-3 py-1 text-xs font-normal"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All Required Skills */}
                {selectedAnalysis.requiredSkills && (
                  <Card className="bg-[#070b19] border-slate-800/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-white">
                        All Required Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {selectedAnalysis.requiredSkills.map((skill: string, i: number) => {
                        const isMatching = selectedAnalysis.currentSkills?.includes(skill);
                        return (
                          <Badge
                            key={i}
                            className={
                              isMatching
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800 px-3 py-1 text-xs"
                                : "bg-red-950/80 text-red-300 border-red-900 px-3 py-1 text-xs"
                            }
                          >
                            {skill}
                          </Badge>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {selectedAnalysis.recommendations && (
                  <Card className="bg-[#070b19] border-slate-800/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-400" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
                        {selectedAnalysis.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-[#070b19] border-slate-800/80 h-full flex flex-col justify-center min-h-[300px]">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="p-4 rounded-full bg-blue-950/40 text-blue-400 border border-blue-900/40">
                    <Target className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold text-slate-200">Select an analysis</p>
                  <p className="text-sm text-slate-400 max-w-sm">
                    Choose a previous analysis or run a new one
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
