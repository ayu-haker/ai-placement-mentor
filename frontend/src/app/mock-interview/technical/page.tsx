"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import type { Interview } from "@/types";
import { Code, Send, Loader2, CheckCircle, XCircle, Plus, X } from "lucide-react";

export default function TechnicalInterviewPage() {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const startInterview = async () => {
    try {
      const res: any = await api.interviews.start({
        mode: "technical",
        skills: skills.length > 0 ? skills : undefined,
      });
      setInterview(res.interview);
      setStarted(true);
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const submitAnswer = async () => {
    if (!interview || !answer.trim()) return;
    setSubmitting(true);
    try {
      const question = interview.questions[currentQuestionIndex];
      const res: any = await api.interviews.submitAnswer({
        interviewId: interview.id,
        questionId: question._id || "",
        answer,
      });

      setInterview((prev) => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          answer,
          feedback: res.feedback,
        };
        return { ...prev, questions: updatedQuestions };
      });

      setAnswer("");
      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const completeInterview = async () => {
    if (!interview) return;
    try {
      const res: any = await api.interviews.complete(interview.id);
      setInterview((prev) =>
        prev
          ? { ...prev, overallScore: res.interview.overallScore, feedback: res.interview.feedback, status: "completed" }
          : prev
      );
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      console.error(err);
    }
  };

  if (completed && interview) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Interview Complete!</h1>
          <p className="text-muted-foreground">Here&apos;s your technical interview feedback</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-6xl font-bold text-primary">{interview.overallScore}%</p>
            <Progress value={interview.overallScore} className="w-64 mx-auto" />
            <p className="text-sm text-muted-foreground">Duration: {formatTime(interview.duration)}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interview.feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interview.feedback.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Technical Accuracy</p>
              <div className="flex items-center gap-3">
                <Progress value={interview.feedback.technicalAccuracy} className="flex-1" />
                <span className="text-sm font-medium">{interview.feedback.technicalAccuracy}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Communication</p>
              <div className="flex items-center gap-3">
                <Progress value={interview.feedback.communicationScore} className="flex-1" />
                <span className="text-sm font-medium">{interview.feedback.communicationScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{interview.feedback.overallFeedback}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {interview.feedback.suggestions.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={startInterview}>Practice Again</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Technical Interview</h1>
          <p className="text-muted-foreground">Practice technical questions with AI feedback</p>
        </div>

        <Card>
          <CardContent className="py-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium">Configure Your Interview</p>
              <p className="text-sm text-muted-foreground">Add skills you want to be tested on</p>
            </div>

            <div className="space-y-3">
              <Label>Skills to Test</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React, Node.js, Python"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={startInterview}>
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = interview?.questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Technical Interview</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {interview?.questions.length}
          </p>
        </div>
        <Badge variant="outline">{formatTime(timer)}</Badge>
      </div>

      <Progress value={((currentQuestionIndex + 1) / (interview?.questions.length || 1)) * 100} />

      {question && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{question.category}</Badge>
              <Badge variant="outline">{question.difficulty}</Badge>
            </div>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer</label>
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="resize-none font-mono"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>
              <Button onClick={submitAnswer} disabled={!answer.trim() || submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" />{currentQuestionIndex < (interview?.questions.length || 1) - 1 ? "Submit & Next" : "Submit & Finish"}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {question?.feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Score:</span>
              <Badge variant={question.feedback.score >= 70 ? "success" : question.feedback.score >= 40 ? "warning" : "destructive"}>
                {question.feedback.score}%
              </Badge>
            </div>
            <p className="text-sm">{question.feedback.comment}</p>
            {question.feedback.keywordsFound.length > 0 && (
              <div>
                <p className="text-xs text-green-600 font-medium mb-1">Keywords Found:</p>
                <div className="flex flex-wrap gap-1">
                  {question.feedback.keywordsFound.map((kw) => (
                    <Badge key={kw} variant="success" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
            {question.feedback.keywordsMissed.length > 0 && (
              <div>
                <p className="text-xs text-red-600 font-medium mb-1">Keywords Missed:</p>
                <div className="flex flex-wrap gap-1">
                  {question.feedback.keywordsMissed.map((kw) => (
                    <Badge key={kw} variant="destructive" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
