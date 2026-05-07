import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { chmod } from 'fs/promises';
import dotenv from 'dotenv';

import { authRoutes } from './routes/auth';
import { jobRoutes } from './routes/jobs';
import { aiRoutes } from './routes/ai';
import { metricsRoutes } from './routes/metrics';
import vectorRoutes from './routes/vector';
import similarityRoutes from './routes/similarity';
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders } from './middleware/security';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { startJobScheduler } from './jobs/scheduler';
import { validateEnvironment } from './config/envValidation';
import { VectorService } from './services/vectorService';

// Load and validate environment variables
dotenv.config();
const config = validateEnvironment();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(securityHeaders);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/vector', vectorRoutes);
app.use('/api/similarity', similarityRoutes);

// Error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database connections
    await connectDatabase();
    await connectRedis();
    
    // Initialize vector service
    const vectorService = new VectorService();
    await vectorService.initialize();
    
    // Start job scheduler
    startJobScheduler(io);
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('Database and cache connections established');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Function to create app without starting server (for testing)
export function createApp() {
  return app;
}

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

export { app, io };
