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
import { Upload, FileText, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res: any = await api.resumes.getAll();
      setResumes(res.resumes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res: any = await api.resumes.upload(formData);
      setResumes((prev) => [res.resume, ...prev]);
      setSelectedResume(res.resume);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.resumes.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResume?.id === id) setSelectedResume(null);
    } catch (err) {
      console.error(err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

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
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Upload your resume for AI-powered ATS analysis and improvement suggestions
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          {uploading ? (
            <div className="space-y-2">
              <p className="font-medium">Analyzing your resume...</p>
              <Progress value={45} className="w-64" />
            </div>
          ) : (
            <>
              <p className="font-medium">
                {isDragActive
                  ? "Drop your resume here"
                  : "Drag & drop your resume here"}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF or DOCX up to 5MB
              </p>
              <Button type="button" variant="outline">
                Browse Files
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Your Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No resumes uploaded yet
            </p>
          ) : (
            resumes.map((resume) => (
              <Card
                key={resume.id}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  selectedResume?.id === resume.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedResume(resume)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-sm truncate max-w-[150px]">
                          {resume.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(resume.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resume.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {resume.analysis && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={
                          resume.analysis.atsScore >= 70
                            ? "success"
                            : resume.analysis.atsScore >= 40
                            ? "warning"
                            : "destructive"
                        }
                      >
                        ATS: {resume.analysis.atsScore}%
                      </Badge>
                      <Badge variant="outline">
                        {resume.status}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedResume?.analysis ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ATS Score Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-primary">
                        {selectedResume.analysis.atsScore}%
                      </p>
                      <p className="text-sm text-muted-foreground">Overall ATS Score</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold">
                        {selectedResume.analysis.formatScore}%
                      </p>
                      <p className="text-sm text-muted-foreground">Format Score</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold">
                        {selectedResume.analysis.contentScore}%
                      </p>
                      <p className="text-sm text-muted-foreground">Content Score</p>
                    </div>
                  </div>
                  <Progress
                    value={selectedResume.analysis.atsScore}
                    className="mt-4"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keywords Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.analysis.keywords.map((kw) => (
                      <Badge key={kw} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedResume.analysis.missingSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Missing Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.analysis.missingSkills.map((skill) => (
                        <Badge key={skill} variant="destructive">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedResume.analysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {selectedResume.analysis.overallFeedback}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select a resume to view analysis</p>
                <p className="text-sm text-muted-foreground">
                  Upload or click on a resume to see detailed ATS analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
