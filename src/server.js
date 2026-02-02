import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cron from 'node-cron';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import missionRoutes from './routes/missions.js';
import journalRoutes from './routes/journals.js';
import assessmentRoutes from './routes/assessments.js';
import moodRoutes from './routes/moods.js';
import alertRoutes from './routes/alerts.js';
import messageRoutes from './routes/messages.js';
import missionAssignmentRoutes from './routes/missionAssignments.js';
import surveyRoutes from './routes/surveys.js';
import surveyAssignmentRoutes from './routes/surveyAssignments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('combined'));

const defaultOrigins = [
  'http://localhost:3000',
  'https://www.echoesofresilience.co',
  'https://echoesofresilience.co'
];

const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/mission-assignments', missionAssignmentRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/survey-assignments', surveyAssignmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Echoes of Resilience Backend Server Running`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

const keepAliveEnabled = process.env.KEEP_ALIVE_ENABLED === 'true';
const keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://localhost:${PORT}/health`;
const keepAliveCron = process.env.KEEP_ALIVE_CRON || '*/14 * * * *';

if (keepAliveEnabled) {
  if (typeof fetch !== 'function') {
    console.warn('⚠️ Keep-alive cron enabled but fetch is not available in this Node version.');
  } else {
    cron.schedule(keepAliveCron, async () => {
      try {
        const response = await fetch(keepAliveUrl, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Keep-alive ping failed with status ${response.status}`);
        }
        console.log(`✅ Keep-alive ping: ${keepAliveUrl} (${response.status})`);
      } catch (error) {
        console.warn(`⚠️ Keep-alive ping failed: ${error.message}`);
      }
    });

    console.log(`🕒 Keep-alive cron scheduled: ${keepAliveCron}`);
    console.log(`📡 Keep-alive target: ${keepAliveUrl}`);
  }
}

export default app;
