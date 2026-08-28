"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Roadmap, RoadmapWeek } from "@/types";
import { CheckCircle2, Circle, Sparkles, Loader2, Target, BookOpen, Layers, CheckSquare, RefreshCw, Compass } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [hasChosenRole, setHasChosenRole] = useState(false);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const res: any = await api.roadmaps.getAll();
      if (res?.roadmaps && res.roadmaps.length > 0 && res.roadmaps[0].targetRole && !res.roadmaps[0].id.includes("default")) {
        setRoadmap(res.roadmaps[0]);
        setHasChosenRole(true);
      } else {
        setHasChosenRole(false);
      }
    } catch {
      setHasChosenRole(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (roleToGenerate?: string) => {
    const role = roleToGenerate || targetRole;
    if (!role.trim()) return;

    setGenerating(true);
    let newRoadmap: Roadmap | null = null;

    try {
      const res: any = await api.roadmaps.generate({
        targetRole: role,
        durationWeeks: 8,
      });
      if (res?.roadmap) {
        newRoadmap = res.roadmap;
      }
    } catch (err) {
      console.error("Backend roadmap generate notice, using instant local generator:", err);
    }

    if (!newRoadmap) {
      newRoadmap = buildLocalRoadmapForRole(role);
    }

    setRoadmap(newRoadmap);
    setHasChosenRole(true);
    setGenerating(false);
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

  // ENTRY STEP: Require user to select/type target career role FIRST!
  if (!hasChosenRole || !roadmap) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
          <Card className="bg-[#070b19] border-slate-800/80 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                <Compass className="h-8 w-8 text-white fill-white/20" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Select Your Target Career Path
              </h1>
              <p className="text-blue-100 text-sm max-w-lg mx-auto font-medium">
                Tell us what role you want to prepare for in your placements!
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Type Your Desired Career / Job Role:
                  </label>
                  <Input
                    placeholder="e.g., DevOps Engineer, Full Stack Web Developer, Data Scientist..."
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 py-6 text-base focus-visible:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!targetRole.trim() || generating}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base py-6 shadow-lg shadow-blue-600/20"
                >
                  {generating ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-5 w-5 mr-2 text-blue-200" />
                  )}
                  {generating ? "Building Your Personalized AI Roadmap..." : "Start My Career Roadmap Journey 🚀"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#070b19] px-3 text-slate-500 font-semibold">Or Pick a Popular Track</span>
                </div>
              </div>

              {/* Popular Role Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "Full Stack Web Developer", icon: "🚀", desc: "React, Node.js, Next.js, Databases & REST APIs" },
                  { title: "DevOps & Cloud Engineer", icon: "⚙️", desc: "Docker, Kubernetes, AWS, CI/CD & Automation" },
                  { title: "Data Scientist / Analyst", icon: "📊", desc: "Python, SQL, Machine Learning & Statistics" },
                  { title: "Java Backend Engineer", icon: "☕", desc: "Java, Spring Boot, Microservices & PostgreSQL" },
                  { title: "AI / ML Engineer", icon: "🤖", desc: "PyTorch, LLMs, LangChain & Model Deployment" },
                  { title: "Cybersecurity Analyst", icon: "🔐", desc: "Network Security, Ethical Hacking & OWASP" },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setTargetRole(item.title);
                      handleGenerate(item.title);
                    }}
                    className="flex flex-col text-left p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // MAIN ROADMAP VIEW: Shows after user selects their target career
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header with Change Career option */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Career Roadmap</h1>
            <p className="text-slate-400 mt-1">
              Personalized week-by-week learning goals & milestone tracking for <span className="text-blue-400 font-semibold">{roadmap.targetRole}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-950/80 text-blue-400 border-blue-900 px-3.5 py-1.5 text-sm font-semibold">
              Target: {roadmap.targetRole}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasChosenRole(false)}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Change Target Career
            </Button>
          </div>
        </div>

        {/* Progress Banner */}
        <Card className="bg-[#070b19] border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Overall Learning Progress
              </span>
              <span className="text-2xl font-extrabold text-blue-400">
                {roadmap.progress || 0}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={roadmap.progress || 0} className="h-3 bg-slate-900" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Duration: {roadmap.totalDuration || "8 Weeks"}</span>
              <span>
                {roadmap.weeks?.filter((w) => w.completed).length || 0} of{" "}
                {roadmap.weeks?.length || 8} weeks completed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Timeline - Interactive Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              Week-by-Week Learning Roadmap for {roadmap.targetRole}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              💡 Click any week checkbox to mark it complete!
            </span>
          </div>

          <div className="space-y-4">
            {roadmap.weeks.map((week: RoadmapWeek, i: number) => (
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

function buildLocalRoadmapForRole(role: string): Roadmap {
  const lower = (role || "").toLowerCase();
  let weeks = [
    { week: 1, focus: `${role} Core Fundamentals & Syntax`, topics: ["Language Syntax", "Git & GitHub", "CLI Tools"], tasks: ["Environment Setup", "First Project"], resources: ["Documentation"], completed: true },
    { week: 2, focus: "Data Structures & Algorithmic Problem Solving", topics: ["Arrays", "Strings", "Hash Maps", "Complexity"], tasks: ["Solve 10 LeetCode Problems"], resources: ["LeetCode"], completed: true },
    { week: 3, focus: `${role} Core Frameworks & Architecture`, topics: ["Architecture Design", "REST APIs", "State & Data Flow"], tasks: ["Build CRUD API Service"], resources: ["Official Docs"], completed: false },
    { week: 4, focus: "Database Design & Data Persistence", topics: ["SQL / NoSQL", "Indexing", "ORMs / Drivers"], tasks: ["Design Database Schema"], resources: ["Database Guide"], completed: false },
    { week: 5, focus: "Authentication, Security & Performance", topics: ["JWT / OAuth", "HTTPS", "Caching", "Rate Limiting"], tasks: ["Implement Security Headers"], resources: ["OWASP Guide"], completed: false },
    { week: 6, focus: "Testing, Containerization & CI/CD", topics: ["Unit Testing", "Docker", "GitHub Actions", "Cloud Deploy"], tasks: ["Deploy Live App"], resources: ["Docker Docs"], completed: false },
    { week: 7, focus: "Capstone Portfolio Project", topics: ["End-to-End System", "Performance Tuning", "Code Review"], tasks: ["Complete Capstone Project"], resources: ["GitHub"], completed: false },
    { week: 8, focus: `${role} Placement & Interview Prep`, topics: ["System Design", "Behavioral STAR Method", "Mock Interview"], tasks: ["Complete Mock Interview"], resources: ["InterviewBit"], completed: false },
  ];

  if (lower.includes("devops") || lower.includes("cloud")) {
    weeks = [
      { week: 1, focus: "Linux CLI, System Admin & Shell Scripting", topics: ["Linux Admin", "Bash Scripting", "SSH", "Networking Basics"], tasks: ["Automate backup script"], resources: ["Linux Handbook"], completed: true },
      { week: 2, focus: "Version Control & GitHub Actions CI/CD", topics: ["Git Workflows", "GitHub Actions", "Build Pipelines"], tasks: ["Create CI build pipeline"], resources: ["GitHub Docs"], completed: true },
      { week: 3, focus: "Docker Containerization & Microservices", topics: ["Dockerfiles", "Docker Compose", "Multi-stage Builds"], tasks: ["Containerize full stack app"], resources: ["Docker Docs"], completed: false },
      { week: 4, focus: "Kubernetes Architecture & Orchestration", topics: ["Pods & Services", "Deployments", "Ingress Controllers"], tasks: ["Deploy 3-tier app to K8s"], resources: ["Kubernetes.io"], completed: false },
      { week: 5, focus: "Infrastructure as Code (Terraform & Ansible)", topics: ["Terraform HCL", "AWS Provider", "Ansible Playbooks"], tasks: ["Provision EC2 with Terraform"], resources: ["HashiCorp"], completed: false },
      { week: 6, focus: "Cloud Computing (AWS / GCP / Azure)", topics: ["EC2 & S3", "VPC & Security Groups", "IAM Policies"], tasks: ["Configure Cloud VPC"], resources: ["AWS Docs"], completed: false },
      { week: 7, focus: "Monitoring, Logging & Alerting", topics: ["Prometheus", "Grafana Dashboards", "ELK Stack"], tasks: ["Set up Grafana Dashboard"], resources: ["Grafana Docs"], completed: false },
      { week: 8, focus: "DevOps Placement & Mock Interviews", topics: ["High Availability", "Disaster Recovery", "ATS Resume"], tasks: ["Complete DevOps Mock Interview"], resources: ["InterviewBit"], completed: false },
    ];
  } else if (lower.includes("data") || lower.includes("python")) {
    weeks = [
      { week: 1, focus: "Python for Data Analysis & Pandas", topics: ["Python Syntax", "NumPy", "Pandas DataFrames"], tasks: ["Clean messy CSV dataset"], resources: ["Kaggle"], completed: true },
      { week: 2, focus: "Advanced SQL & Database Analytics", topics: ["Complex JOINs", "Window Functions", "Subqueries"], tasks: ["Solve 10 SQL Analytics queries"], resources: ["LeetCode SQL"], completed: true },
      { week: 3, focus: "Exploratory Data Analysis & Visualization", topics: ["Matplotlib", "Seaborn", "Plotly Dashboards"], tasks: ["Build Interactive EDA Dashboard"], resources: ["Seaborn Docs"], completed: false },
      { week: 4, focus: "Machine Learning Fundamentals", topics: ["Regression", "Classification", "Decision Trees"], tasks: ["Train Churn Prediction Model"], resources: ["Scikit-Learn"], completed: false },
      { week: 5, focus: "Supervised & Unsupervised ML", topics: ["Random Forests", "K-Means", "PCA Dimension Reduction"], tasks: ["Tune Hyperparameters"], resources: ["Scikit-Learn"], completed: false },
      { week: 6, focus: "Deep Learning & PyTorch", topics: ["Neural Networks", "PyTorch Tensors", "Loss Functions"], tasks: ["Train Image Classifier"], resources: ["PyTorch.org"], completed: false },
      { week: 7, focus: "MLOps & Model API Deployment", topics: ["FastAPI Endpoint", "Streamlit Dashboard", "Docker"], tasks: ["Deploy ML Model API Live"], resources: ["Docker Docs"], completed: false },
      { week: 8, focus: "Data Science Placement Prep", topics: ["A/B Testing", "Behavioral Interview", "Portfolio Presentation"], tasks: ["Present Capstone Data Project"], resources: ["InterviewBit"], completed: false },
    ];
  } else if (lower.includes("ai") || lower.includes("ml") || lower.includes("machine")) {
    weeks = [
      { week: 1, focus: "Mathematics & Python for AI", topics: ["Linear Algebra", "Calculus", "PyTorch Tensors"], tasks: ["Implement Matrix Math from scratch"], resources: ["3Blue1Brown"], completed: true },
      { week: 2, focus: "Deep Learning & Neural Networks", topics: ["CNNs", "RNNs", "Attention Mechanism"], tasks: ["Train ResNet Image Classifier"], resources: ["PyTorch Docs"], completed: true },
      { week: 3, focus: "Transformer Models & LLMs", topics: ["BERT", "GPT Architecture", "HuggingFace Transformers"], tasks: ["Fine-tune Transformer model"], resources: ["HuggingFace"], completed: false },
      { week: 4, focus: "Prompt Engineering & RAG Pipelines", topics: ["LangChain", "Vector Databases (Chroma)", "RAG"], tasks: ["Build Document QA Bot"], resources: ["LangChain Docs"], completed: false },
      { week: 5, focus: "Fine-Tuning & Model Optimization", topics: ["LoRA / QLoRA", "Quantization (GGUF)", "Ollama"], tasks: ["Quantize 7B LLM"], resources: ["Ollama Docs"], completed: false },
      { week: 6, focus: "AI Agents & Autonomous Workflows", topics: ["Agentic Frameworks", "Function Calling", "Tool Use"], tasks: ["Build Web Researcher AI Agent"], resources: ["AutoGPT"], completed: false },
      { week: 7, focus: "AI Model Serving & Production", topics: ["FastAPI Serving", "CUDA GPU Acceleration", "Docker"], tasks: ["Deploy LLM API to Production"], resources: ["FastAPI Docs"], completed: false },
      { week: 8, focus: "AI Engineer Placement Prep", topics: ["AI System Design", "Coding Challenges", "Mock Interview"], tasks: ["Complete AI Mock Interview"], resources: ["InterviewBit"], completed: false },
    ];
  } else if (lower.includes("cyber") || lower.includes("security")) {
    weeks = [
      { week: 1, focus: "Networking Protocols & Security Fundamentals", topics: ["TCP/IP", "DNS & HTTP/HTTPS", "Wireshark Packet Capture"], tasks: ["Analyze Packet Logs"], resources: ["Wireshark"], completed: true },
      { week: 2, focus: "Linux Administration & Hardening", topics: ["Linux Security", "File Permissions", "Privilege Escalation"], tasks: ["Harden Ubuntu Server"], resources: ["Linux Security Guide"], completed: true },
      { week: 3, focus: "Ethical Hacking & Penetration Testing", topics: ["Nmap", "Metasploit", "Vulnerability Scanning"], tasks: ["Perform Nmap Reconnaissance"], resources: ["TryHackMe"], completed: false },
      { week: 4, focus: "Web Application Security (OWASP Top 10)", topics: ["SQL Injection", "XSS", "CSRF", "Auth Vulnerabilities"], tasks: ["Fix Vulnerabilities in Web App"], resources: ["OWASP Guide"], completed: false },
      { week: 5, focus: "Cryptography & PKI Certificates", topics: ["AES / RSA Encryption", "TLS Handshakes", "Certificates"], tasks: ["Configure HTTPS for Web App"], resources: ["Mozilla SSL"], completed: false },
      { week: 6, focus: "SIEM & Threat Monitoring", topics: ["Splunk / Elastic SIEM", "Log Analysis", "Snort IDS"], tasks: ["Build Threat Detection Rule"], resources: ["Splunk Docs"], completed: false },
      { week: 7, focus: "Digital Forensics & Malware Analysis", topics: ["Memory Forensics", "Autopsy", "YARA Rules"], tasks: ["Analyze Memory Dump Sample"], resources: ["Autopsy Guide"], completed: false },
      { week: 8, focus: "Cybersecurity Placement Prep", topics: ["Security+ Prep", "Scenario Questions", "Mock Interview"], tasks: ["Complete Security Mock Interview"], resources: ["InterviewBit"], completed: false },
    ];
  }

  return {
    id: `rm_${Date.now()}`,
    userId: "guest",
    targetRole: role,
    totalDuration: "8 Weeks",
    progress: 25,
    isActive: true,
    startedAt: new Date().toISOString(),
    weeks,
    milestones: [],
  };
}
