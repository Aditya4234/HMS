import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
dotenv.config();

import { validateEnv } from './config/env';
import { connectDatabase } from './config/database';
import { connectMongoDB } from './config/mongodb';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { setCsrfCookie, csrfTokenEndpoint } from './middlewares/csrf';
import { initializeSocket } from './sockets';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Route imports
import authRoutes from './routes/authRoutes';
import mongoAuthRoutes from './routes/mongoAuthRoutes';
import roomRoutes from './routes/roomRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import customerRoutes from './routes/customerRoutes';
import staffRoutes from './routes/staffRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';
import hotelRoutes from './routes/hotelRoutes';
import reviewRoutes from './routes/reviewRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import webhookRoutes from './routes/webhookRoutes';
import randomUserRoutes from './routes/randomUserRoutes';
import googleAuthRoutes from './routes/googleAuthRoutes';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Initialize socket handlers
initializeSocket(io);

const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

// Webhooks - must be before JSON middleware (raw body needed)
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(compression());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', apiLimiter);
app.use('/api', setCsrfCookie);

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hotel Management API Docs',
}));

// JSON endpoint for OpenAPI spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Make io accessible in routes
app.set('io', io);

// CSRF token endpoint (public)
app.get('/api/csrf-token', setCsrfCookie, csrfTokenEndpoint);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/mongo-auth', mongoAuthRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/random-users', randomUserRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Hotel Management API', docs: '/api-docs', api: '/api' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Hotel Management API is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();
  await connectDatabase();
  await connectMongoDB();

  httpServer.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
    console.log('📡 API: http://localhost:' + PORT + '/api');
    console.log('📖 API Docs: http://localhost:' + PORT + '/api-docs');
    console.log('🔌 WebSocket: ws://localhost:' + PORT);

    if (process.env.NODE_ENV === 'production') {
      console.log('\n🏁 Production Checklist:');
      console.log('   [ ] Use `npx prisma migrate deploy` instead of db push');
      console.log('   [ ] Set strong JWT secrets (32+ chars)');
      console.log('   [ ] Configure STRIPE_WEBHOOK_SECRET');
      console.log('   [ ] Set NODE_ENV=production');
      console.log('   [ ] Configure FRONTEND_URL for CORS');
    }
  });
};

startServer();
