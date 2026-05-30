"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Code } from "lucide-react";

export default function MockInterviewPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mock Interview</h1>
        <p className="text-muted-foreground">
          Practice with AI-generated interview questions tailored to your skills
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => router.push("/mock-interview/hr")}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">HR Interview</CardTitle>
            <CardDescription>
              Practice behavioral and HR interview questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Communication skills assessment
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Behavioral questions
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Leadership & teamwork scenarios
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Detailed personality feedback
              </li>
            </ul>
            <Button className="w-full mt-4">Start HR Interview</Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => router.push("/mock-interview/technical")}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Technical Interview</CardTitle>
            <CardDescription>
              Practice technical questions based on your skill set
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Role-specific technical questions
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Problem-solving scenarios
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Coding & design questions
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Technical accuracy scoring
              </li>
            </ul>
            <Button className="w-full mt-4">Start Technical Interview</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
