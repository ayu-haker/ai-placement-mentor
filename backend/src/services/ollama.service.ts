import ollamaConfig from '../config/ollama';
import {
  ResumeAnalysis,
  InterviewFeedback,
  SkillGapResult,
  CareerRoadmap,
  ChatMessage,
} from '../types';

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

interface OllamaStreamChunk {
  model: string;
  response: string;
  done: boolean;
}

export class OllamaService {
  private baseUrl: string;
  private model: string;
  private fallbackModel: string;
  private maxRetries: number;
  private retryDelayMs: number;
  private requestTimeoutMs: number;

  constructor() {
    this.baseUrl = ollamaConfig.baseUrl;
    this.model = ollamaConfig.model;
    this.fallbackModel = ollamaConfig.fallbackModel;
    this.maxRetries = ollamaConfig.maxRetries;
    this.retryDelayMs = ollamaConfig.retryDelayMs;
    this.requestTimeoutMs = ollamaConfig.requestTimeoutMs;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return [];
      const data = await res.json() as { models?: { name: string }[] };
      return (data.models || []).map((m) => m.name);
    } catch {
      return [];
    }
  }

  async isModelAvailable(model: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some(
      (m) => m === model || m.startsWith(`${model}:`)
    );
  }

  async pullModel(model: string): Promise<void> {
    console.log(`Pulling model: ${model}...`);
    const res = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: false }),
      signal: AbortSignal.timeout(600000),
    });

    if (!res.ok) {
      throw new Error(`Failed to pull model ${model}: ${res.statusText}`);
    }
    console.log(`Model ${model} pulled successfully`);
  }

  async ensureModelAvailable(): Promise<string> {
    const primaryAvailable = await this.isModelAvailable(this.model);
    if (primaryAvailable) {
      console.log(`Primary model "${this.model}" is available`);
      return this.model;
    }

    const fallbackAvailable = await this.isModelAvailable(this.fallbackModel);
    if (fallbackAvailable) {
      console.log(`Falling back to model "${this.fallbackModel}"`);
      return this.fallbackModel;
    }

    console.log(`Model "${this.model}" not found. Pulling...`);
    try {
      await this.pullModel(this.model);
      return this.model;
    } catch (err) {
      console.error(`Failed to pull "${this.model}":`, err);
      console.log(`Trying fallback model "${this.fallbackModel}"...`);
      await this.pullModel(this.fallbackModel);
      return this.fallbackModel;
    }
  }

  private async generateWithRetry(
    prompt: string,
    model?: string
  ): Promise<string> {
    const activeModel = model || this.model;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: activeModel,
            prompt,
            stream: false,
            options: {
              temperature: 0.2,
              top_p: 0.9,
            },
          }),
          signal: AbortSignal.timeout(this.requestTimeoutMs),
        });

        if (!res.ok) {
          throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json() as OllamaGenerateResponse;
        return data.response;
      } catch (error: any) {
        lastError = error;
        console.error(
          `Attempt ${attempt}/${this.maxRetries} failed:`,
          error.message
        );

        if (attempt < this.maxRetries) {
          await new Promise((r) => setTimeout(r, this.retryDelayMs * attempt));
        }
      }
    }

    if (lastError) {
      try {
        console.warn('Retrying with fallback model...');
        const res = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.fallbackModel,
            prompt,
            stream: false,
          }),
          signal: AbortSignal.timeout(this.requestTimeoutMs),
        });

        if (res.ok) {
          const data = await res.json() as OllamaGenerateResponse;
          return data.response;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    throw new Error(
      `Failed to generate AI response after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  async generateStreaming(
    prompt: string,
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<string> {
    const activeModel = model || this.model;
    let fullResponse = '';

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt,
          stream: true,
          options: { temperature: 0.2 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama streaming error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk: OllamaStreamChunk = JSON.parse(line);
            fullResponse += chunk.response;
            onChunk(chunk.response);
          } catch {
            // skip malformed lines
          }
        }
      }

      return fullResponse;
    } catch (error: any) {
      console.error('Streaming failed, falling back to non-streaming:', error.message);
      const result = await this.generateWithRetry(prompt, activeModel);
      onChunk(result);
      return result;
    }
  }

  private extractJSON(text: string): string {
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const start = cleaned.indexOf('{');
    if (start !== -1) {
      let depth = 0;
      let end = -1;
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        if (cleaned[i] === '}') depth--;
        if (depth === 0) { end = i; break; }
      }
      if (end !== -1) return cleaned.slice(start, end + 1);
    }

    const arrStart = cleaned.indexOf('[');
    if (arrStart !== -1) {
      let depth = 0;
      let arrEnd = -1;
      for (let i = arrStart; i < cleaned.length; i++) {
        if (cleaned[i] === '[') depth++;
        if (cleaned[i] === ']') depth--;
        if (depth === 0) { arrEnd = i; break; }
      }
      if (arrEnd !== -1) return cleaned.slice(arrStart, arrEnd + 1);
    }

    return cleaned;
  }

  async analyzeResume(
    resumeText: string,
    jobDescription?: string
  ): Promise<ResumeAnalysis> {
    const prompt = `
You are an expert ATS resume analyzer. Analyze the resume below and return ONLY valid JSON.

Resume:
${resumeText.slice(0, 8000)}

${jobDescription ? `Target Role:\n${jobDescription}` : ''}

Return valid JSON (no markdown, no explanation):
{
  "atsScore": 0-100,
  "keywords": ["keyword1", "keyword2"],
  "missingSkills": ["skill1"],
  "suggestions": ["suggestion1"],
  "formatScore": 0-100,
  "contentScore": 0-100,
  "overallFeedback": "feedback string"
}`;

    const response = await this.generateWithRetry(prompt);
    return JSON.parse(this.extractJSON(response));
  }

  async generateInterviewQuestions(
    mode: 'hr' | 'technical',
    skills?: string[],
    previousQuestions?: string[]
  ): Promise<any[]> {
    const context = previousQuestions?.length
      ? `\nAvoid these previously asked questions:\n${previousQuestions.join('\n')}`
      : '';

    const prompt = `
You are an expert interviewer. Generate 3 ${mode} interview questions${mode === 'technical' ? ` focusing on these skills: ${skills?.join(', ')}` : ' for HR/behavioral assessment'}.
${context}

Return ONLY a valid JSON array with 3 questions, no markdown:
[
  {
    "id": "q1",
    "question": "the interview question",
    "category": "${mode === 'technical' ? 'technical' : 'behavioral'}",
    "difficulty": "easy|medium|hard",
    "expectedKeywords": ["keyword1", "keyword2"]
  }
]`;

    const response = await this.generateWithRetry(prompt);
    const extracted = this.extractJSON(response);
    const parsed = JSON.parse(extracted);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
    // Single question object returned instead of array — wrap it
    if (parsed.question) return [parsed];
    console.error('Raw interview response:', extracted.slice(0, 500));
    throw new Error(`Unexpected interview questions format: ${typeof parsed}`);
  }

  async evaluateInterviewAnswer(
    question: string,
    answer: string,
    _expectedKeywords: string[]
  ): Promise<{ score: number; comment: string; keywordsFound: string[]; keywordsMissed: string[] }> {
    const prompt = `
Evaluate this interview answer:

Question: ${question}
Answer: ${answer}

Return ONLY valid JSON (no markdown):
{
  "score": 0-100,
  "comment": "detailed feedback",
  "keywordsFound": ["keyword1"],
  "keywordsMissed": ["keyword2"]
}`;

    const response = await this.generateWithRetry(prompt);
    return JSON.parse(this.extractJSON(response));
  }

  async generateInterviewFeedback(
    questions: { question: string; answer: string; score: number }[]
  ): Promise<InterviewFeedback> {
    const qaSummary = questions
      .map((q) => `Q: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/100`)
      .join('\n\n');

    const prompt = `
As an expert interviewer, provide comprehensive feedback on this interview:

${qaSummary}

Return ONLY valid JSON (no markdown):
{
  "score": 0-100,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "suggestions": ["suggestion1"],
  "technicalAccuracy": 0-100,
  "communicationScore": 0-100,
  "overallFeedback": "comprehensive feedback"
}`;

    const response = await this.generateWithRetry(prompt);
    return JSON.parse(this.extractJSON(response));
  }

  async analyzeSkillGap(
    currentSkills: string[],
    targetRole: string
  ): Promise<SkillGapResult> {
    const prompt = `
Analyze the skill gap for a candidate targeting a ${targetRole} role.

Current Skills: ${currentSkills.join(', ')}

Return ONLY valid JSON (no markdown):
{
  "currentSkills": ${JSON.stringify(currentSkills)},
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": ["missing1"],
  "recommendations": ["recommendation1"],
  "resources": [
    {
      "title": "resource title",
      "type": "course|tutorial|book|article|video",
      "url": "url or search:topic",
      "platform": "platform name",
      "duration": "estimated duration"
    }
  ],
  "matchPercentage": 0-100
}`;

    const response = await this.generateWithRetry(prompt);
    return JSON.parse(this.extractJSON(response));
  }

  async generateRoadmap(
    currentSkills: string[],
    targetRole: string,
    durationWeeks: number = 12
  ): Promise<CareerRoadmap> {
    const prompt = `
Create a ${durationWeeks}-week career roadmap for someone targeting a ${targetRole} role.

Current Skills: ${currentSkills.join(', ')}

Return ONLY valid JSON (no markdown):
{
  "weeks": [
    {
      "week": 1,
      "focus": "weekly focus",
      "topics": ["topic1"],
      "tasks": ["task1"],
      "resources": ["resource1"]
    }
  ],
  "totalDuration": "${durationWeeks} weeks",
  "milestones": [
    {
      "title": "milestone title",
      "week": 1,
      "description": "description",
      "completed": false
    }
  ]
}

Generate exactly ${durationWeeks} entries in the weeks array.`;

    const response = await this.generateWithRetry(prompt);
    return JSON.parse(this.extractJSON(response));
  }

  async chat(
    message: string,
    history: ChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const historyContext = history
      .slice(-10)
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const prompt = `
You are an AI Career Counselor. You help students with career guidance, technology recommendations, interview preparation tips, and placement strategies. Be supportive, practical, and specific.

Conversation History:
${historyContext}

Student's Message: ${message}

Provide a helpful, actionable response. Keep it concise but comprehensive.`;

    if (onChunk) {
      return this.generateStreaming(prompt, onChunk);
    }
    return this.generateWithRetry(prompt);
  }
}

export const ollamaService = new OllamaService();
