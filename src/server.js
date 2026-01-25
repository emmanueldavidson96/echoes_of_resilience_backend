import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

export default app;
