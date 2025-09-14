import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './app/config';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { notFound } from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rate_limit_window_ms,
  max: config.rate_limit_max_requests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: config.frontend_url,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'School Management API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.node_env
  });
});

// API documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'School Management System API Documentation',
    version: '1.0.0',
    baseUrl: '/api',
    endpoints: {
      auth: '/api/auth',
      superadmin: '/api/superadmin',
      admin: '/api/admin',
      teacher: '/api/teacher',
      student: '/api/student',
      parent: '/api/parent',
      accountant: '/api/accountant'
    },
    health: '/health'
  });
});

// API routes
app.use('/api', router);

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;