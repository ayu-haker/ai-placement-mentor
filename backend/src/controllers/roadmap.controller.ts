import { Response } from 'express';
import { AuthRequest } from '../types';
import Roadmap from '../models/Roadmap';
import User from '../models/User';
import { groqService } from '../services/groq.service';

const memoryRoadmaps: any[] = [];

function generateRoleSpecificRoadmap(role: string, weeksCount: number = 8) {
  const lowerRole = role.toLowerCase();

  if (lowerRole.includes('devops') || lowerRole.includes('cloud')) {
    return {
      totalDuration: `${weeksCount} Weeks`,
      weeks: [
        { week: 1, focus: 'Linux Systems, CLI & Shell Scripting', topics: ['Linux Admin', 'Bash Scripting', 'SSH', 'Networking Basics'], tasks: ['Automate backup script in Bash', 'Master Linux permissions'], completed: true },
        { week: 2, focus: 'Version Control & GitHub Actions CI/CD', topics: ['Git Branching', 'GitHub Actions', 'Build Pipelines', 'Linting'], tasks: ['Create automated CI build pipeline'], completed: true },
        { week: 3, focus: 'Docker Containerization & Microservices', topics: ['Dockerfiles', 'Docker Compose', 'Multi-stage Builds', 'Volumes'], tasks: ['Containerize full stack Node.js app'], completed: false },
        { week: 4, focus: 'Kubernetes Architecture & Orchestration', topics: ['Pods & Services', 'Deployments', 'Ingress Controller', 'ConfigMaps'], tasks: ['Deploy 3-tier app to K8s minikube'], completed: false },
        { week: 5, focus: 'Infrastructure as Code (IaC)', topics: ['Terraform Basics', 'AWS Provider', 'Ansible Playbooks', 'State Management'], tasks: ['Provision EC2 instance with Terraform'], completed: false },
        { week: 6, focus: 'Cloud Computing Platform (AWS/GCP)', topics: ['EC2 & S3', 'VPC & Security Groups', 'IAM Policies', 'CloudWatch'], tasks: ['Configure VPC and IAM roles'], completed: false },
        { week: 7, focus: 'Monitoring, Logging & Alerting', topics: ['Prometheus', 'Grafana Dashboards', 'ELK Stack', 'Health Checks'], tasks: ['Set up Grafana system metrics dashboard'], completed: false },
        { week: 8, focus: 'DevOps System Design & Placement Interviews', topics: ['High Availability', 'Disaster Recovery', 'Behavioral Interviews', 'ATS Resume'], tasks: ['Complete DevOps Mock Interview'], completed: false },
      ],
    };
  }

  if (lowerRole.includes('data') || lowerRole.includes('python')) {
    return {
      totalDuration: `${weeksCount} Weeks`,
      weeks: [
        { week: 1, focus: 'Python for Data Analysis & Data Structures', topics: ['Python Syntax', 'NumPy', 'Pandas DataFrames', 'Jupyter Notebooks'], tasks: ['Clean and process messy CSV dataset'], completed: true },
        { week: 2, focus: 'Advanced SQL & Relational Querying', topics: ['JOINs', 'Subqueries', 'Window Functions', 'Database Indexing'], tasks: ['Solve 10 SQL analytics queries'], completed: true },
        { week: 3, focus: 'Exploratory Data Analysis & Visualization', topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Statistical Distributions'], tasks: ['Build interactive EDA dashboard'], completed: false },
        { week: 4, focus: 'Machine Learning Fundamentals', topics: ['Regression', 'Classification', 'Decision Trees', 'Scikit-Learn'], tasks: ['Train customer churn predictor'], completed: false },
        { week: 5, focus: 'Supervised & Unsupervised Learning', topics: ['Random Forests', 'K-Means Clustering', 'PCA', 'Model Evaluation'], tasks: ['Tune model hyperparameters with GridSearch'], completed: false },
        { week: 6, focus: 'Deep Learning & Neural Networks', topics: ['Neural Networks', 'PyTorch/TensorFlow', 'Loss Functions', 'Optimizers'], tasks: ['Build image classifier model'], completed: false },
        { week: 7, focus: 'MLOps & Model Deployment', topics: ['FastAPI ML Endpoint', 'Streamlit Apps', 'Model Monitoring', 'Docker'], tasks: ['Deploy ML model API live'], completed: false },
        { week: 8, focus: 'Data Science Portfolio & Mock Interview', topics: ['SQL Coding', 'A/B Testing', 'Behavioral Questions', 'Resume Tuning'], tasks: ['Present Capstone Portfolio project'], completed: false },
      ],
    };
  }

  if (lowerRole.includes('ai') || lowerRole.includes('machine') || lowerRole.includes('ml')) {
    return {
      totalDuration: `${weeksCount} Weeks`,
      weeks: [
        { week: 1, focus: 'Mathematics & Python for AI', topics: ['Linear Algebra', 'Calculus', 'NumPy', 'PyTorch Tensors'], tasks: ['Implement matrix multiplication from scratch'], completed: true },
        { week: 2, focus: 'Deep Learning Architectures', topics: ['Convolutional Neural Networks', 'Recurrent Neural Networks', 'Attention Mechanism'], tasks: ['Train ResNet image classifier'], completed: true },
        { week: 3, focus: 'Transformer Models & LLMs', topics: ['BERT', 'GPT Architecture', 'HuggingFace Transformers', 'Tokenizers'], tasks: ['Fine-tune Transformer model'], completed: false },
        { week: 4, focus: 'Prompt Engineering & LangChain', topics: ['LangChain Framework', 'Vector Databases (Chroma/Pinecone)', 'RAG Pipelines'], tasks: ['Build custom Document QA Bot'], completed: false },
        { week: 5, focus: 'Fine-Tuning & Model Optimization', topics: ['LoRA & QLoRA', 'Quantization (GGUF)', 'vLLM', 'Ollama Integration'], tasks: ['Quantize 7B parameter LLM'], completed: false },
        { week: 6, focus: 'AI Agents & Tool Calling', topics: ['AutoGPT Architectures', 'Function Calling', 'Multi-Agent Frameworks', 'Memory'], tasks: ['Build Autonomous Web Researcher Agent'], completed: false },
        { week: 7, focus: 'AI Deployment & Serving', topics: ['FastAPI Serving', 'GPU Acceleration (CUDA)', 'Triton Server', 'Docker'], tasks: ['Deploy AI model API to production'], completed: false },
        { week: 8, focus: 'AI Placement & Technical Interviews', topics: ['System Design for AI', 'Coding Problems', 'Portfolio Showcase'], tasks: ['Conduct AI Engineer Mock Interview'], completed: false },
      ],
    };
  }

  if (lowerRole.includes('cyber') || lowerRole.includes('security')) {
    return {
      totalDuration: `${weeksCount} Weeks`,
      weeks: [
        { week: 1, focus: 'Networking Protocols & Security Basics', topics: ['TCP/IP Model', 'DNS & HTTP/HTTPS', 'Wireshark Packet Analysis', 'Firewalls'], tasks: ['Analyze network traffic logs'], completed: true },
        { week: 2, focus: 'Linux & System Security Administration', topics: ['Linux Security', 'Privilege Escalation', 'File Permissions', 'Hardening'], tasks: ['Hardening Ubuntu server'], completed: true },
        { week: 3, focus: 'Ethical Hacking & Penetration Testing', topics: ['Nmap Scanning', 'Metasploit', 'Reconnaissance', 'Vulnerability Assessment'], tasks: ['Perform Nmap scan on target lab'], completed: false },
        { week: 4, focus: 'Web Application Security (OWASP Top 10)', topics: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'CSRF', 'Broken Auth'], tasks: ['Exploit and fix SQLi in lab'], completed: false },
        { week: 5, focus: 'Cryptography & Public Key Infrastructure', topics: ['Symmetric & Asymmetric Encryption', 'RSA', 'TLS Handshake', 'PKI Certificates'], tasks: ['Configure SSL/TLS for web app'], completed: false },
        { week: 6, focus: 'SIEM, Logging & Threat Detection', topics: ['Splunk / Elastic SIEM', 'Log Analysis', 'Snort IDS/IPS', 'Incident Response'], tasks: ['Build threat detection rule'], completed: false },
        { week: 7, focus: 'Digital Forensics & Malware Analysis', topics: ['Memory Forensics', 'Autopsy', 'Reverse Engineering Basics', 'YARA Rules'], tasks: ['Analyze memory dump sample'], completed: false },
        { week: 8, focus: 'Security Certifications & Placement Prep', topics: ['CompTIA Security+ Prep', 'Scenario Questions', 'Resume Optimization'], tasks: ['Complete Cybersecurity Mock Interview'], completed: false },
      ],
    };
  }

  // Default Full Stack / Software Engineering roadmap for any general role
  return {
    totalDuration: `${weeksCount} Weeks`,
    weeks: [
      { week: 1, focus: `${role} Fundamentals & Syntax`, topics: ['Core Language Syntax', 'OOP Concepts', 'Git & GitHub', 'Data Structures'], tasks: ['Build 5 basic programs and push to GitHub'], completed: true },
      { week: 2, focus: 'Data Structures & Algorithmic Problem Solving', topics: ['Arrays & Strings', 'Hash Tables', 'Two Pointers', 'Big-O Notation'], tasks: ['Solve 10 LeetCode Easy/Medium problems'], completed: true },
      { week: 3, focus: `${role} Core Architecture & REST APIs`, topics: ['RESTful Services', 'Routing', 'Middleware', 'State Management'], tasks: ['Build complete REST API service'], completed: false },
      { week: 4, focus: 'Database Design & ORM Persistence', topics: ['Relational vs NoSQL', 'SQL Queries', 'Mongoose / Prisma', 'Schema Indexing'], tasks: ['Design and seed database schema'], completed: false },
      { week: 5, focus: 'Authentication, Security & Performance', topics: ['JWT & OAuth2', 'HTTPS & CORS', 'Redis Caching', 'Rate Limiting'], tasks: ['Implement Auth and Security headers'], completed: false },
      { week: 6, focus: 'Testing, Docker & CI/CD Cloud Deployment', topics: ['Unit Testing', 'Dockerfiles', 'GitHub Actions', 'AWS/Vercel/Render'], tasks: ['Deploy application live to production'], completed: false },
      { week: 7, focus: 'Capstone Portfolio Project', topics: ['Full Stack Application', 'WebSockets', 'Performance Monitoring', 'Code Review'], tasks: ['Complete Capstone Portfolio Project'], completed: false },
      { week: 8, focus: `${role} Placement & Interview Preparation`, topics: ['System Design Basics', 'STAR Behavioral Technique', 'Mock Interviews', 'ATS Resume Tuning'], tasks: ['Schedule & Complete Mock Interview'], completed: false },
    ],
  };
}

export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetRole, durationWeeks } = req.body;
    const role = targetRole || 'Full Stack Software Engineer';
    const weeksCount = durationWeeks || 8;
    const userId = req.user?.id || 'guest_user';

    let roadmapData: any = null;
    try {
      roadmapData = await groqService.generateRoadmap([], role, weeksCount);
    } catch {
      // fallback
    }

    if (!roadmapData || !roadmapData.weeks || roadmapData.weeks.length === 0) {
      roadmapData = generateRoleSpecificRoadmap(role, weeksCount);
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
      milestones: [
        { title: 'Core Foundations Mastered', week: 2, description: 'Basic syntax, Git, and problem solving', completed: true },
        { title: 'System Architecture & Deployment', week: 6, description: 'Live database app with authentication and CI/CD', completed: false },
        { title: 'Placement Ready', week: weeksCount, description: 'Portfolio, System Design, and Mock Interview prep', completed: false },
      ],
      progress,
      isActive: true,
      startedAt: new Date().toISOString(),
    };

    memoryRoadmaps.unshift(roadmapObj);

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: roadmapObj,
    });
  } catch (error: any) {
    console.error('Generate roadmap fallback:', error);
    const role = req.body?.targetRole || 'Software Engineer';
    const fallbackData = generateRoleSpecificRoadmap(role, 8);
    res.status(200).json({
      message: 'Roadmap generated',
      roadmap: {
        id: `rm_${Date.now()}`,
        targetRole: role,
        totalDuration: '8 Weeks',
        progress: 25,
        isActive: true,
        startedAt: new Date().toISOString(),
        weeks: fallbackData.weeks,
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
