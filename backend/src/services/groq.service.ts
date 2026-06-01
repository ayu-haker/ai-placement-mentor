import Groq from 'groq-sdk';
import groqConfig from '../config/groq';
import {
  ResumeAnalysis,
  InterviewFeedback,
  SkillGapResult,
  CareerRoadmap,
  ChatMessage,
} from '../types';

export class GroqService {
  private client: Groq;
  private model: string;
  private fallbackModel: string;
  private maxRetries: number;
  private retryDelayMs: number;
  private requestTimeoutMs: number;

  constructor() {
    this.client = new Groq({ apiKey: groqConfig.apiKey });
    this.model = groqConfig.model;
    this.fallbackModel = groqConfig.fallbackModel;
    this.maxRetries = groqConfig.maxRetries;
    this.retryDelayMs = groqConfig.retryDelayMs;
    this.requestTimeoutMs = groqConfig.requestTimeoutMs;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const models = await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const models = await this.client.models.list();
      return models.data.map((m: { id: string }) => m.id);
    } catch {
      return [];
    }
  }

  async isModelAvailable(model: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some((m) => m.includes(model) || m === model);
  }

  async ensureModelAvailable(): Promise<string> {
    const models = await this.listModels();
    const primaryAvail = models.some((m) => m.includes(this.model));
    if (primaryAvail) {
      console.log(`Groq model "${this.model}" is available`);
      return this.model;
    }
    const fallbackAvail = models.some((m) => m.includes(this.fallbackModel));
    if (fallbackAvail) {
      console.log(`Falling back to Groq model "${this.fallbackModel}"`);
      return this.fallbackModel;
    }
    console.warn('No configured model found on Groq, using default');
    return this.model;
  }

  private async generateWithRetry(
    systemPrompt: string,
    userMessage: string,
    model?: string
  ): Promise<string> {
    const activeModel = model || this.model;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const completion = await this.client.chat.completions.create(
          {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            model: activeModel,
            temperature: 0.2,
            top_p: 0.9,
            stream: false,
          },
          { timeout: this.requestTimeoutMs }
        );

        return completion.choices[0]?.message?.content || '';
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
        const completion = await this.client.chat.completions.create(
          {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            model: this.fallbackModel,
            temperature: 0.2,
            top_p: 0.9,
            stream: false,
          },
          { timeout: this.requestTimeoutMs }
        );

        if (completion.choices[0]?.message?.content) {
          return completion.choices[0].message.content;
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
    systemPrompt: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<string> {
    const activeModel = model || this.model;
    let fullResponse = '';

    try {
      const stream = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: activeModel,
        temperature: 0.2,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        onChunk(content);
      }

      return fullResponse;
    } catch (error: any) {
      console.error('Streaming failed, falling back to non-streaming:', error.message);
      const result = await this.generateWithRetry(systemPrompt, userMessage, activeModel);
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
    const response = await this.generateWithRetry(
      'You are an expert ATS resume analyzer. Return ONLY valid JSON, no markdown, no explanation.',
      `Analyze the resume below${jobDescription ? ` for the role: ${jobDescription}` : ''} and return valid JSON:
{
  "atsScore": 0-100,
  "keywords": ["keyword1", "keyword2"],
  "missingSkills": ["skill1"],
  "suggestions": ["suggestion1"],
  "formatScore": 0-100,
  "contentScore": 0-100,
  "overallFeedback": "feedback string"
}

Resume:
${resumeText.slice(0, 8000)}`
    );
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

    const response = await this.generateWithRetry(
      'You are an expert interviewer. Return ONLY valid JSON, no markdown, no explanation.',
      `Generate 3 ${mode} interview questions${mode === 'technical' ? ` focusing on these skills: ${skills?.join(', ')}` : ' for HR/behavioral assessment'}.
${context}

Return a valid JSON array with 3 questions:
[
  {
    "id": "q1",
    "question": "the interview question",
    "category": "${mode === 'technical' ? 'technical' : 'behavioral'}",
    "difficulty": "easy|medium|hard",
    "expectedKeywords": ["keyword1", "keyword2"]
  }
]`
    );
    const extracted = this.extractJSON(response);
    const parsed = JSON.parse(extracted);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
    if (parsed.question) return [parsed];
    console.error('Raw interview response:', extracted.slice(0, 500));
    throw new Error(`Unexpected interview questions format: ${typeof parsed}`);
  }

  async evaluateInterviewAnswer(
    question: string,
    answer: string,
    _expectedKeywords: string[]
  ): Promise<{ score: number; comment: string; keywordsFound: string[]; keywordsMissed: string[] }> {
    const response = await this.generateWithRetry(
      'You are an expert interview evaluator. Return ONLY valid JSON, no markdown, no explanation.',
      `Evaluate this interview answer:

Question: ${question}
Answer: ${answer}

Return valid JSON:
{
  "score": 0-100,
  "comment": "detailed feedback",
  "keywordsFound": ["keyword1"],
  "keywordsMissed": ["keyword2"]
}`
    );
    return JSON.parse(this.extractJSON(response));
  }

  async generateInterviewFeedback(
    questions: { question: string; answer: string; score: number }[]
  ): Promise<InterviewFeedback> {
    const qaSummary = questions
      .map((q) => `Q: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/100`)
      .join('\n\n');

    const response = await this.generateWithRetry(
      'You are an expert interviewer providing comprehensive feedback. Return ONLY valid JSON, no markdown, no explanation.',
      `Provide comprehensive feedback on this interview:

${qaSummary}

Return valid JSON:
{
  "score": 0-100,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "suggestions": ["suggestion1"],
  "technicalAccuracy": 0-100,
  "communicationScore": 0-100,
  "overallFeedback": "comprehensive feedback"
}`
    );
    return JSON.parse(this.extractJSON(response));
  }

  async analyzeSkillGap(
    currentSkills: string[],
    targetRole: string
  ): Promise<SkillGapResult> {
    const response = await this.generateWithRetry(
      'You are a skill gap analysis expert. Return ONLY valid JSON, no markdown, no explanation.',
      `Analyze the skill gap for a candidate targeting a ${targetRole} role.

Current Skills: ${currentSkills.join(', ')}

Return valid JSON:
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
}`
    );
    return JSON.parse(this.extractJSON(response));
  }

  async generateRoadmap(
    currentSkills: string[],
    targetRole: string,
    durationWeeks: number = 12
  ): Promise<CareerRoadmap> {
    const response = await this.generateWithRetry(
      'You are a career roadmap planning expert. Return ONLY valid JSON, no markdown, no explanation.',
      `Create a ${durationWeeks}-week career roadmap for someone targeting a ${targetRole} role.

Current Skills: ${currentSkills.join(', ')}

Return valid JSON:
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

Generate exactly ${durationWeeks} entries in the weeks array.`
    );
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

    const systemPrompt = 'You are an AI Career Counselor. You help students with career guidance, technology recommendations, interview preparation tips, and placement strategies. Be supportive, practical, and specific.';

    const userMessage = `Conversation History:
${historyContext}

Student's Message: ${message}

Provide a helpful, actionable response. Keep it concise but comprehensive.`;

    if (onChunk) {
      return this.generateStreaming(systemPrompt, userMessage, onChunk);
    }
    return this.generateWithRetry(systemPrompt, userMessage);
  }
}

export const groqService = new GroqService();
