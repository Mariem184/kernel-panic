import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { config, validateConfig } from './config/env.js';
import { chatRouter } from './routes/chat.js';
import { isQdrantHealthy } from './services/rag/qdrantClient.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies (like Vercel or Nginx)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiter for chat endpoint: max 40 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please slow down and try again later.',
    answer: 'Sorry, you are sending messages too quickly. Please wait a moment before asking again.'
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const qdrantOk = await isQdrantHealthy();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      groqConfigured: Boolean(config.groq.apiKey),
      qdrantConnected: qdrantOk,
      groqModel: config.groq.model
    }
  });
});

// Mount chat route with rate limiting
app.use('/api/chat', chatLimiter, chatRouter);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    error: 'Internal server error',
    answer: "Sorry, I'm having trouble processing your request right now. Please try again."
  });
});

const server = app.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(` Kernel Panic AI Assistant Backend`);
  console.log(` Running on: http://localhost:${config.port}`);
  console.log(` Health check: http://localhost:${config.port}/api/health`);
  console.log(` Chat API: POST http://localhost:${config.port}/api/chat`);
  console.log(`======================================================\n`);

  const { valid, warnings } = validateConfig();
  if (!valid) {
    warnings.forEach((w) => console.warn(`[CONFIG WARNING] ${w}`));
  }
});

export default app;
