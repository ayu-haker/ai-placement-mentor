import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { ollamaService } from './services/ollama.service';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      ollama: ollamaReady ? 'connected' : 'pending',
      database: dbReady ? 'connected' : 'pending',
    },
  });
});

app.get('/health/ollama', async (_req, res) => {
  const healthy = await ollamaService.checkHealth();
  res.json({
    status: healthy ? 'ok' : 'error',
    ollama: healthy ? 'reachable' : 'unreachable',
  });
});

app.get('/health/models', async (_req, res) => {
  try {
    const models = await ollamaService.listModels();
    const primaryAvailable = await ollamaService.isModelAvailable(
      process.env.OLLAMA_MODEL || 'llama3'
    );
    const fallbackAvailable = await ollamaService.isModelAvailable(
      process.env.OLLAMA_FALLBACK_MODEL || 'gemma'
    );
    res.json({
      models,
      primary: {
        name: process.env.OLLAMA_MODEL || 'llama3',
        available: primaryAvailable,
      },
      fallback: {
        name: process.env.OLLAMA_FALLBACK_MODEL || 'gemma',
        available: fallbackAvailable,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

let ollamaReady = false;
let dbReady = false;

const initOllama = async (): Promise<void> => {
  const maxAttempts = process.env.NODE_ENV === 'production' ? 30 : 5;
  for (let i = 1; i <= maxAttempts; i++) {
    const healthy = await ollamaService.checkHealth();
    if (healthy) {
      console.log('Ollama service is ready');
      ollamaReady = true;
      try {
        const model = await ollamaService.ensureModelAvailable();
        console.log(`Using Ollama model: ${model}`);
      } catch (err) {
        console.error('Model check failed:', err);
      }
      return;
    }
    if (i < maxAttempts) {
      console.log(`Waiting for Ollama (attempt ${i}/${maxAttempts})...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.warn('Ollama not available. AI features will be disabled until Ollama starts.');
};

const startServer = async () => {
  try {
    await connectDatabase();
    dbReady = true;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log('Initializing Ollama in background...');
    });

    initOllama().catch((err) => {
      console.error('Ollama initialization error:', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
