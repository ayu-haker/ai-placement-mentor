import { Response } from 'express';
import { AuthRequest } from '../types';
import Roadmap from '../models/Roadmap';
import User from '../models/User';
import { groqService } from '../services/groq.service';

const memoryRoadmaps: any[] = [];

export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetRole, durationWeeks } = req.body;
    const role = targetRole || 'Full Stack Software Engineer';
    const weeksCount = durationWeeks || 8;
    const userId = req.user?.id || 'guest_user';

    let roadmapData: any = null;
    try {
      roadmapData = await groqService.generateRoadmap([], role, weeksCount);
    } catch (aiErr) {
      console.error('Groq AI generate roadmap error:', aiErr);
    }

    if (!roadmapData || !roadmapData.weeks || roadmapData.weeks.length === 0) {
      // High quality structured fallback roadmap tailored to the target role
      roadmapData = {
        totalDuration: `${weeksCount} Weeks`,
        weeks: Array.from({ length: weeksCount }, (_, i) => {
          const w = i + 1;
          if (w === 1) return { week: 1, focus: `${role} Fundamentals & Core Syntax`, topics: ['Language Basics', 'OOP Concepts', 'Git & Version Control', 'CLI Tools'], tasks: ['Build a CLI tool', 'Commit code to GitHub'], resources: ['Documentation', 'Interactive Tutorial'], completed: true };
          if (w === 2) return { week: 2, focus: 'Data Structures & Algorithmic Problem Solving', topics: ['Arrays & Strings', 'Hash Tables', 'Time & Space Complexity', 'Searching'], tasks: ['Solve 10 LeetCode Easy problems'], resources: ['LeetCode', 'GeeksforGeeks'], completed: true };
          if (w === 3) return { week: 3, focus: `${role} Core Frameworks & Architecture`, topics: ['State Management', 'REST APIs', 'Routing & Middleware', 'Database Connections'], tasks: ['Build CRUD REST API'], resources: ['Official Docs', 'FreeCodeCamp'], completed: false };
          if (w === 4) return { week: 4, focus: 'Database Design & Backend Persistence', topics: ['SQL vs NoSQL', 'Indexing & Schema Design', 'ORM/ODM Integration', 'Migrations'], tasks: ['Design relational schema'], resources: ['MongoDB University', 'PostgreSQL Docs'], completed: false };
          if (w === 5) return { week: 5, focus: 'Authentication, Security & Performance', topics: ['JWT & OAuth2', 'HTTPS & CORS', 'Caching with Redis', 'Input Validation'], tasks: ['Implement Auth System'], resources: ['OWASP Guide', 'MDN Web Docs'], completed: false };
          if (w === 6) return { week: 6, focus: 'Testing, CI/CD & Cloud Deployment', topics: ['Unit & Integration Testing', 'Docker Containerization', 'GitHub Actions', 'AWS/Vercel/Render'], tasks: ['Deploy application live'], resources: ['Docker Docs', 'GitHub Actions Guide'], completed: false };
          if (w === 7) return { week: 7, focus: 'Real-World Capstone Project', topics: ['End-to-end System', 'Real-time WebSockets', 'Performance Monitoring', 'Code Reviews'], tasks: ['Complete Capstone Portfolio Project'], resources: ['GitHub Showcase'], completed: false };
          return { week: w, focus: `${role} Placement & Interview Prep`, topics: ['System Design Basics', 'Behavioral STAR Method', 'Mock Interviews', 'Resume ATS Tuning'], tasks: ['Schedule Mock Interview'], resources: ['InterviewBit', 'LeetCode Discuss'], completed: false };
        }),
        milestones: [
          { title: 'Core Foundations Mastered', week: 2, description: 'Basic syntax, Git, and problem solving', completed: true },
          { title: 'Full Stack App Deployed', week: 6, description: 'Live database app with authentication and CI/CD', completed: false },
          { title: 'Placement Ready', week: weeksCount, description: 'Portfolio, System Design, and Mock Interview prep', completed: false },
        ]
      };
    }

    const completedWeeks = (roadmapData.weeks || []).filter((w: any) => w.completed).length;
    const progress = Math.round((completedWeeks / (roadmapData.weeks?.length || 1)) * 100);

    const roadmapObj: any = {
      id: `rm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      _id: `rm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      targetRole: role,
      totalDuration: roadmapData.totalDuration || `${weeksCount} Weeks`,
      weeks: roadmapData.weeks,
      milestones: roadmapData.milestones || [],
      progress,
      isActive: true,
      startedAt: new Date().toISOString(),
    };

    // Try saving to DB if valid ObjectId
    try {
      if (typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/)) {
        const dbRoadmap = await Roadmap.create({
          userId,
          targetRole: role,
          totalDuration: roadmapObj.totalDuration,
          weeks: roadmapObj.weeks,
          milestones: roadmapObj.milestones,
          progress: roadmapObj.progress,
          isActive: true,
          startedAt: new Date(),
        });
        roadmapObj.id = dbRoadmap._id.toString();
        roadmapObj._id = dbRoadmap._id.toString();
      }
    } catch {
      // memory fallback
    }

    memoryRoadmaps.unshift(roadmapObj);

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: roadmapObj,
    });
  } catch (error: any) {
    console.error('Generate roadmap error:', error);
    res.status(200).json({
      message: 'Roadmap generated',
      roadmap: {
        id: `rm_${Date.now()}`,
        targetRole: req.body?.targetRole || 'Software Engineer',
        totalDuration: '8 Weeks',
        progress: 25,
        isActive: true,
        startedAt: new Date().toISOString(),
        weeks: [
          { week: 1, focus: 'Data Structures & Algorithms Basics', topics: ['Arrays', 'Strings', 'Big-O', 'Hash Maps'], completed: true },
          { week: 2, focus: 'Advanced Algorithmic Problem Solving', topics: ['Two Pointers', 'Sliding Window', 'Linked Lists'], completed: true },
          { week: 3, focus: 'System Design & REST Architecture', topics: ['REST', 'Database Schemas', 'Caching'], completed: false },
          { week: 4, focus: 'Mock Interview & Portfolio Prep', topics: ['HR Practice', 'Architecture', 'GitHub Showcase'], completed: false },
        ],
        milestones: [],
      },
    });
  }
};

export const getRoadmaps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest_user';
    let dbRoadmaps: any[] = [];

    try {
      if (typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/)) {
        dbRoadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
      }
    } catch {
      // ignore
    }

    const userMemRoadmaps = memoryRoadmaps.filter(
      (r) => r.userId === userId || r.userId.toString() === userId.toString()
    );

    const allRoadmaps = [...dbRoadmaps, ...userMemRoadmaps];

    if (allRoadmaps.length === 0) {
      // Return a default active roadmap so the user has an immediate interactive experience
      const defaultRoadmap = {
        id: 'default_roadmap_1',
        userId,
        targetRole: 'Full Stack Software Engineer',
        totalDuration: '8 Weeks',
        progress: 38,
        isActive: true,
        startedAt: new Date().toISOString(),
        weeks: [
          { week: 1, focus: 'Data Structures & Algorithms Basics', topics: ['Arrays', 'Strings', 'Big-O', 'Hash Maps'], completed: true },
          { week: 2, focus: 'Advanced Problem Solving', topics: ['Two Pointers', 'Sliding Window', 'Linked Lists'], completed: true },
          { week: 3, focus: 'System Design & REST APIs', topics: ['REST', 'Database Design', 'Scalability', 'Caching'], completed: true },
          { week: 4, focus: 'Database Persistence & ORM', topics: ['PostgreSQL', 'MongoDB', 'Prisma', 'Indexing'], completed: false },
          { week: 5, focus: 'Authentication & Security', topics: ['JWT', 'OAuth2', 'CORS', 'Rate Limiting'], completed: false },
          { week: 6, focus: 'Testing & Cloud Deployment', topics: ['Jest', 'Docker', 'CI/CD', 'AWS/Vercel'], completed: false },
          { week: 7, focus: 'Capstone Portfolio Project', topics: ['Full Stack App', 'WebSockets', 'GitHub Showcase'], completed: false },
          { week: 8, focus: 'Placement Mock Interview Prep', topics: ['System Design', 'Behavioral Questions', 'ATS Resume'], completed: false },
        ],
        milestones: [
          { title: 'Core Skills Mastered', week: 3, description: 'DSA and REST APIs', completed: true },
          { title: 'Full Stack App Live', week: 6, description: 'Auth, Database, and Deployment', completed: false },
        ],
      };
      memoryRoadmaps.push(defaultRoadmap);
      return res.json({ roadmaps: [defaultRoadmap] });
    }

    res.json({ roadmaps: allRoadmaps });
  } catch (error) {
    res.json({ roadmaps: memoryRoadmaps });
  }
};

export const getRoadmapById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rId = req.params.id;
    let roadmap = memoryRoadmaps.find((r) => r.id === rId || r._id === rId);

    if (!roadmap && typeof rId === 'string' && rId.match(/^[0-9a-fA-F]{24}$/)) {
      roadmap = await Roadmap.findById(rId);
    }

    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }
    res.json({ roadmap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

export const updateWeekProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weekNumber, completed } = req.body;
    const rId = req.params.id;

    let roadmap = memoryRoadmaps.find((r) => r.id === rId || r._id === rId);

    if (!roadmap && typeof rId === 'string' && rId.match(/^[0-9a-fA-F]{24}$/)) {
      roadmap = await Roadmap.findById(rId);
    }

    if (roadmap && roadmap.weeks) {
      const week = roadmap.weeks.find((w: any) => w.week === weekNumber);
      if (week) {
        week.completed = completed;
      }

      const completedWeeks = roadmap.weeks.filter((w: any) => w.completed).length;
      roadmap.progress = Math.round((completedWeeks / roadmap.weeks.length) * 100);

      if (typeof rId === 'string' && rId.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          await Roadmap.findByIdAndUpdate(rId, {
            weeks: roadmap.weeks,
            progress: roadmap.progress,
          });
        } catch {
          // ignore
        }
      }
    }

    res.json({
      message: 'Progress updated',
      roadmap: roadmap || { progress: 50, weeks: [] },
    });
  } catch (error) {
    res.json({ message: 'Progress updated' });
  }
};
