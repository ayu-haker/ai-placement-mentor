import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { groqService } from './services/groq.service';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
      groq: groqReady ? 'connected' : 'pending',
      database: dbReady ? 'connected' : 'pending',
    },
  });
});

app.get('/health/groq', async (_req, res) => {
  const healthy = await groqService.checkHealth();
  res.json({
    status: healthy ? 'ok' : 'error',
    groq: healthy ? 'reachable' : 'unreachable',
  });
});

app.get('/health/models', async (_req, res) => {
  try {
    const models = await groqService.listModels();
    const primaryAvailable = await groqService.isModelAvailable(
      process.env.GROQ_MODEL || 'llama3-8b-8192'
    );
    const fallbackAvailable = await groqService.isModelAvailable(
      process.env.GROQ_FALLBACK_MODEL || 'gemma2-9b-it'
    );
    res.json({
      models,
      primary: {
        name: process.env.GROQ_MODEL || 'llama3-8b-8192',
        available: primaryAvailable,
      },
      fallback: {
        name: process.env.GROQ_FALLBACK_MODEL || 'gemma2-9b-it',
        available: fallbackAvailable,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

let groqReady = false;
let dbReady = false;

const initGroq = async (): Promise<void> => {
  const healthy = await groqService.checkHealth();
  if (healthy) {
    console.log('Groq API is ready');
    groqReady = true;
    try {
      const model = await groqService.ensureModelAvailable();
      console.log(`Using Groq model: ${model}`);
    } catch (err) {
      console.error('Model check failed:', err);
    }
    return;
  }
  console.warn('Groq API not available. Check your GROQ_API_KEY.');
};

const startServer = async () => {
  try {
    await connectDatabase();
    dbReady = true;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log('Initializing Groq in background...');
    });

    initGroq().catch((err) => {
      console.error('Groq initialization error:', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
