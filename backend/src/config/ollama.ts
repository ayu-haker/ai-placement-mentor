import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'tinyllama';
const OLLAMA_FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'llama3';

export const ollamaConfig = {
  baseUrl: OLLAMA_BASE_URL,
  model: OLLAMA_MODEL,
  fallbackModel: OLLAMA_FALLBACK_MODEL,
  maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES || '3', 10),
  retryDelayMs: parseInt(process.env.OLLAMA_RETRY_DELAY || '2000', 10),
  requestTimeoutMs: parseInt(process.env.OLLAMA_TIMEOUT || '300000', 10),
};

export default ollamaConfig;
