export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  profile: {
    phone?: string;
    college?: string;
    graduationYear?: number;
    branch?: string;
    cgpa?: number;
    skills: string[];
    resumeUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  placementReadiness: {
    score: number;
    lastUpdated: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  analysis: ResumeAnalysis;
  status: "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  formatScore: number;
  contentScore: number;
  keywords: string[];
  missingSkills: string[];
  suggestions: string[];
  overallFeedback: string;
}

export interface Interview {
  id: string;
  userId: string;
  mode: "hr" | "technical";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  questions: InterviewQuestion[];
  overallScore: number;
  feedback: InterviewFeedback;
  duration: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface InterviewQuestion {
  _id?: string;
  question: string;
  category: string;
  difficulty: string;
  answer?: string;
  feedback?: {
    score: number;
    comment: string;
    keywordsFound: string[];
    keywordsMissed: string[];
  };
}

export interface InterviewFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  communicationScore: number;
  technicalAccuracy: number;
  overallFeedback: string;
}

export interface SkillAssessment {
  id: string;
  userId: string;
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  recommendations: string[];
  resources: LearningResource[];
  assessmentDate: string;
}

export interface LearningResource {
  title: string;
  type: "course" | "tutorial" | "book" | "article" | "video";
  url: string;
  platform: string;
  duration?: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  totalDuration: string;
  weeks: RoadmapWeek[];
  milestones: Milestone[];
  progress: number;
  isActive: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  topics: string[];
  tasks: string[];
  resources: string[];
  completed: boolean;
}

export interface Milestone {
  title: string;
  week: number;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DashboardData {
  placementReadiness: number;
  totalInterviews: number;
  completedInterviews: number;
  totalResumes: number;
  currentSkills: string[];
  skillMatch: number;
  targetRole: string;
  roadmapProgress: number;
  roadmapTarget: string;
  recentResumes: Resume[];
  recentInterviews: Interview[];
  latestAssessment: SkillAssessment | null;
  activeRoadmap: Roadmap | null;
  activities: Activity[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface Activity {
  type: string;
  description: string;
  score?: number;
  date: string;
}

export interface AdminStats {
  totalStudents: number;
  totalResumes: number;
  totalInterviews: number;
  completedInterviews: number;
  studentsWithInterviews: number;
  averageInterviewScore: number;
  topSkills: { name: string; count: number }[];
}
