import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db } from './config/db';

import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import crmRoutes from './routes/crm.routes';
import salesRoutes from './routes/sales.routes';
import clientsRoutes from './routes/clients.routes';
import projectsRoutes from './routes/projects.routes';
import financeRoutes from './routes/finance.routes';
import marketingRoutes from './routes/marketing.routes';
import activitiesRoutes from './routes/activities.routes';
import reportsRoutes from './routes/reports.routes';
import integrationsRoutes from './routes/integrations.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Trust proxy — required to get correct client IPs behind Render/Vercel/Nginx
// ---------------------------------------------------------------------------
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// ---------------------------------------------------------------------------
// CORS — supports Vercel previews & production custom domains
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, or mobile requests with no origin header
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    const isVercelDomain = cleanOrigin.endsWith('.vercel.app');
    const isLocalhost = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');

    if (
      allowedOrigins.includes(cleanOrigin) ||
      isVercelDomain ||
      isLocalhost ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'Range',
    'Origin',
    'Cache-Control',
    'Pragma'
  ]
}));

// ---------------------------------------------------------------------------
// Body Parsing — limit prevents JSON body DoS attacks
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: false, limit: '500kb' }));

// ---------------------------------------------------------------------------
// Root & Health Check
// ---------------------------------------------------------------------------
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'OptiVir CRM Enterprise API',
    version: '1.0.0',
    message: 'OptiVir CRM Backend API is operational and healthy.',
    endpoints: {
      health: '/health',
      healthDb: '/health/db',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      crm: '/api/crm',
      sales: '/api/sales',
      clients: '/api/clients',
      projects: '/api/projects',
      marketing: '/api/marketing',
      finance: '/api/finance',
      reports: '/api/reports',
      settings: '/api/settings'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'OptiVir CRM Enterprise Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/db', async (req: Request, res: Response) => {
  const diagnostics = db.getDiagnostics();
  try {
    const dbRes = await db.query('SELECT current_database(), current_user, count(*) as user_count FROM users;');
    const orgUsersRes = await db.query('SELECT count(*) as org_users_count FROM organization_users;');
    res.json({
      success: true,
      status: 'connected',
      diagnostics,
      database: dbRes.rows[0],
      orgUsersCount: orgUsersRes.rows[0]?.org_users_count,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'disconnected',
      diagnostics,
      error: err.message,
      detail: 'Failed connecting to database pool',
      hint: diagnostics.isSupabasePooler && !diagnostics.userHasPoolerTenant
        ? 'Supabase Pooler requires DB_USER in format: postgres.[project-ref] (e.g. postgres.ituizznwyamrdcfvymam)'
        : 'Verify DB_PASSWORD and DATABASE_URL in environment settings.',
      timestamp: new Date().toISOString()
    });
  }
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/settings', settingsRoutes);

// ---------------------------------------------------------------------------
// 404 Catch-All Handler
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found on OptiVir CRM Backend`
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error caught by global handler]:', err);
  // Don't leak internal error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred'
    : (err.message || 'Internal Server Error');
  res.status(err.status || 500).json({
    success: false,
    message
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 OptiVir CRM Backend running on http://localhost:${PORT}`);
    try {
      const res = await db.query('SELECT current_database(), current_user, count(*) as user_count FROM users;');
      console.log(`✅ PostgreSQL Connected to [${res.rows[0]?.current_database}] as [${res.rows[0]?.current_user}] (${res.rows[0]?.user_count} users loaded)`);
    } catch (err: any) {
      console.error(`❌ CRITICAL: PostgreSQL connection failed on startup: ${err.message}`);
    }
  });
}

export default app;
