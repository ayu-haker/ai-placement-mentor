"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Resume } from "@/types";
import { Upload, FileText, Trash2, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res: any = await api.resumes.getAll();
      const loaded = res.resumes || [];
      setResumes(loaded);
      if (loaded.length > 0) {
        setSelectedResume(loaded[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("resume", file);

      const res: any = await api.resumes.upload(formData);
      if (res?.resume) {
        setResumes((prev) => [res.resume, ...prev]);
        setSelectedResume(res.resume);
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setUploadError(err?.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.resumes.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id && (r as any)._id !== id));
      if (selectedResume?.id === id || (selectedResume as any)?._id === id) {
        setSelectedResume(null);
      }
    } catch (err) {
      console.error(err);
      setResumes((prev) => prev.filter((r) => r.id !== id && (r as any)._id !== id));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resume Analyzer</h1>
          <p className="text-slate-400 mt-1">
            Upload your resume for AI-powered ATS analysis and improvement suggestions
          </p>
        </div>

        {uploadError && (
          <div className="p-4 rounded-lg bg-red-950/60 border border-red-900 text-red-300 text-sm">
            {uploadError}
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-blue-500 bg-blue-950/40"
              : "border-blue-900/40 bg-[#070b19] hover:border-blue-700/60 hover:bg-[#0a0f24]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-full bg-blue-950/60 text-blue-400 border border-blue-900/60">
              {uploading ? <Loader2 className="h-7 w-7 animate-spin text-blue-400" /> : <Upload className="h-7 w-7" />}
            </div>
            <div>
              <p className="font-semibold text-lg text-slate-200">
                {uploading ? "Uploading & Analyzing Resume with AI..." : "Drag & drop your resume here"}
              </p>
              <p className="text-sm text-slate-400 mt-1">PDF, DOCX, or TXT up to 5MB</p>
            </div>
            <Button
              variant="outline"
              disabled={uploading}
              className="mt-2 bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              {uploading ? "Analyzing..." : "Browse Files"}
            </Button>
          </div>
        </div>

        {/* Resumes List & Analysis Split Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Your Resumes */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-bold text-white">Your Resumes</h2>
            {resumes.length === 0 ? (
              <Card className="bg-[#070b19] border-slate-800/80">
                <CardContent className="py-8 text-center text-slate-400 text-sm">
                  No resumes uploaded yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => {
                  const rId = resume.id || (resume as any)._id;
                  const isSelected = selectedResume?.id === rId || (selectedResume as any)?._id === rId;
                  return (
                    <Card
                      key={rId}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/30 shadow-md"
                          : "bg-[#070b19] border-slate-800/80 hover:border-slate-700"
                      }`}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-6 w-6 text-blue-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-slate-200 truncate">
                                {resume.fileName}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatDate(resume.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(rId);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {resume.analysis && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/60">
                            <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/60 font-semibold">
                              ATS: {resume.analysis.atsScore}%
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                              {resume.status}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Analysis Detail */}
          <div className="lg:col-span-2">
            {selectedResume && selectedResume.analysis ? (
              <div className="space-y-6">
                <Card className="bg-[#070b19] border-slate-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-100">
                      <span>ATS Match Score</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {selectedResume.analysis.atsScore}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={selectedResume.analysis.atsScore} className="h-3 bg-slate-900" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedResume.analysis.overallFeedback}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-[#070b19] border-slate-800/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        Keywords Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {selectedResume.analysis.keywords?.map((k: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#070b19] border-slate-800/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {selectedResume.analysis.suggestions?.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-[#070b19] border-slate-800/80 h-full flex flex-col justify-center min-h-[300px]">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="p-4 rounded-full bg-blue-950/40 text-blue-400 border border-blue-900/40">
                    <FileText className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold text-slate-200">
                    Select a resume to view analysis
                  </p>
                  <p className="text-sm text-slate-400 max-w-sm">
                    Upload or click on a resume to see detailed ATS analysis
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
