import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export interface ResumeAnalysis {
  atsScore: number;
  keywords: string[];
  missingSkills: string[];
  suggestions: string[];
  formatScore: number;
  contentScore: number;
  overallFeedback: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  expectedKeywords: string[];
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  technicalAccuracy?: number;
  communicationScore?: number;
  overallFeedback: string;
}

export interface SkillGapResult {
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  resources: LearningResource[];
  matchPercentage: number;
}

export interface LearningResource {
  title: string;
  type: 'course' | 'tutorial' | 'book' | 'article' | 'video';
  url: string;
  platform: string;
  duration?: string;
}

export interface CareerRoadmap {
  weeks: RoadmapWeek[];
  totalDuration: string;
  milestones: Milestone[];
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  topics: string[];
  tasks: string[];
  resources: string[];
}

export interface Milestone {
  title: string;
  week: number;
  description: string;
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  averageScore: number;
  interviewPassRate: number;
  topSkills: { name: string; count: number }[];
}
