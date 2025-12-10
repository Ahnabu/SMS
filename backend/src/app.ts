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

// Handle preflight requests before rate limiting
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rate limiting - more permissive in development
const limiter = rateLimit({
  windowMs: config.rate_limit_window_ms,
  max: config.node_env === 'development' ? 1000 : config.rate_limit_max_requests, // 1000 requests in dev, 100 in prod
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and docs in development
    if (config.node_env === 'development' && (req.url === '/health' || req.url === '/api/docs')) {
      return true;
    }
    return false;
  }
});
app.use('/api/', limiter);

// CORS configuration - more permissive in development
app.use(cors({
  origin: function (origin, callback) {
    // In development, allow all localhost origins
    if (config.node_env === 'development') {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Parse allowed origins from config
    let allowedOrigins: string[] = ['http://localhost:3000', 'http://localhost:3001'];
    
    if (config.allowed_origins) {
      if (Array.isArray(config.allowed_origins)) {
        allowedOrigins = [...allowedOrigins, ...config.allowed_origins];
      } else if (typeof config.allowed_origins === 'string') {
        allowedOrigins = [...allowedOrigins, ...config.allowed_origins.split(',').map(o => o.trim())];
      }
    }
    
    // Add frontend_url if defined
    if (config.frontend_url) {
      allowedOrigins.push(config.frontend_url);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
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