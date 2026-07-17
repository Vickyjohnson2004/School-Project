import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import config from './config';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import studentRoutes from './routes/student';
import lecturerRoutes from './routes/admin';
import adminRoutes from './routes/admin-management';
import mlRoutes from './routes/ml';
import predictionRoutes from './routes/predictions';
import reportRoutes from './routes/reports';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: config.frontendUrl, credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 120 });
app.use(limiter);

// Cache the Mongo connection across warm serverless invocations so we don't open
// a new connection (and exhaust the pool) on every request.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  }
  return connectionPromise;
};

// Ensure the database is connected before any route handler runs. On Vercel the
// module may be cold-started, so this lazily connects on the first request.
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.json({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));


app.use(errorHandler);

export { app };
export default app;

// When running as a normal long-lived server (local dev, Render, Railway, Docker)
// start listening. On Vercel the app is imported by api/index.ts instead, and
// this block is skipped because VERCEL is set in that environment.
if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDatabase();
      console.log('MongoDB connected');

      app.listen(config.port, () => {
        console.log(`Backend server running on port ${config.port}`);
      });
    } catch (error) {
      console.error('MongoDB connection error', error);
      process.exit(1);
    }
  };

  startServer();
}
