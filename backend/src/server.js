/**
 * Personal AI Job Finder — Backend Server
 * Express.js API with rate limiting, CORS, and security headers.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import config, { validateConfig } from './config/index.js';
import { connectDatabase } from './config/database.js';
import profileRoutes from './routes/profiles.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validate config on startup
validateConfig();

const app = express();

// --- Middleware ---

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow Vercel frontend domain or all origins for API access
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? (process.env.FRONTEND_URL || true) // true = reflect request origin
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Routes ---
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// External sources directory
import { EXTERNAL_SOURCES, getSourceCount, getIntegratedSources } from './data/externalSources.js';

app.get('/api/sources', (req, res) => {
  res.json({
    success: true,
    totalSources: getSourceCount(),
    integratedCount: getIntegratedSources().length,
    categories: EXTERNAL_SOURCES,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    totalSources: getSourceCount(),
    integratedSources: getIntegratedSources().length,
    services: {
      database: config.hasDatabase ? 'configured' : 'in-memory',
      adzuna: config.hasAdzuna ? 'enabled' : 'disabled',
      remotive: 'enabled',
      arbeitnow: 'enabled',
      remoteok: 'enabled',
      himalayas: 'enabled',
      weworkremotely: 'enabled',
      fourDayWeek: 'enabled',
      jobspresso: 'enabled',
      greenhouse: 'enabled',
      lever: 'enabled',
      llm: config.hasLLM ? 'enabled' : 'disabled',
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
  }

  if (err.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({ success: false, error: err.message });
  }

  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// --- Start Server ---
async function start() {
  // Connect to database (falls back to in-memory if not configured)
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`\n🚀 Personal AI Job Finder API running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health check: http://localhost:${config.port}/api/health\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
