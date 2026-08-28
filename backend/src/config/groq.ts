import dotenv from 'dotenv';

dotenv.config();

export const groqConfig = {
  apiKey: process.env.GROQ_API_KEY || '',
  model: process.env.GROQ_MODEL || 'groq/compound',
  fallbackModel: process.env.GROQ_FALLBACK_MODEL || 'groq/compound-mini',
  maxRetries: parseInt(process.env.GROQ_MAX_RETRIES || '3', 10),
  retryDelayMs: parseInt(process.env.GROQ_RETRY_DELAY || '2000', 10),
  requestTimeoutMs: parseInt(process.env.GROQ_TIMEOUT || '120000', 10),
};

export default groqConfig;
