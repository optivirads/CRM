import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db } from './config/db';
import { requireAuth } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import crmRoutes from './routes/crm.routes';
import salesRoutes from './routes/sales.routes';
import clientsRoutes from './routes/clients.routes';
import projectsRoutes from './routes/projects.routes';
import financeRoutes from './routes/finance.routes';
import marketingRoutes, { syncCampaignTelemetryInternal } from './routes/marketing.routes';
import activitiesRoutes from './routes/activities.routes';
import reportsRoutes from './routes/reports.routes';
import integrationsRoutes from './routes/integrations.routes';
import settingsRoutes from './routes/settings.routes';
import creativesRoutes from './routes/creatives.routes';
import pdfRoutes from './routes/pdf.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Remove X-Powered-By — don't advertise Express to attackers
app.disable('x-powered-by');

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
// CORS — strict origin allowlist only (no wildcard platform bypass)
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,https://optivircrm.vercel.app')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, or mobile with no origin header
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    // In development: also allow localhost variants
    const isLocalhost = process.env.NODE_ENV !== 'production' &&
      (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1'));

    if (allowedOrigins.includes(cleanOrigin) || isLocalhost) {
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
    'Pragma',
    'x-client-session',
    'X-Client-Session',
    'x-portal-token',
    'X-Portal-Token',
    'x-organization-id',
    'X-Organization-Id'
  ]
}));

// ---------------------------------------------------------------------------
// Body Parsing — limit prevents JSON body DoS attacks
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Root & Health Check
// ---------------------------------------------------------------------------
app.get('/', (req: Request, res: Response) => {
  // Minimal response — don't expose endpoint map in production
  res.json({
    status: 'online',
    system: 'OptiVir CRM Enterprise API',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'OptiVir CRM Enterprise Backend',
    timestamp: new Date().toISOString()
  });
});

// DB health — protected: only authenticated internal monitors should access this
app.get('/health/db', requireAuth, async (req: Request, res: Response) => {
  try {
    await db.query('SELECT 1;');
    res.json({
      success: true,
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'disconnected',
      error: 'Database connection failed',
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
app.use('/api/creatives', creativesRoutes);
app.use('/api', creativesRoutes);
app.use('/api/pdf', pdfRoutes);

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
  if (err.type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      message: 'The uploaded file or payload is too large (maximum allowed size is 10MB).'
    });
    return;
  }
  const message = err.message || (process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred'
    : 'Internal Server Error');
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

      // Start periodic background telemetry sync (every 10 minutes)
      setInterval(async () => {
        try {
          const orgs = await db.query(
            "SELECT DISTINCT organization_id FROM organization_integrations WHERE id = 'int-meta' AND connected = true;"
          );
          for (const row of orgs.rows) {
            await syncCampaignTelemetryInternal({ orgId: row.organization_id });
          }
        } catch (err) {
          console.warn('[Background Telemetry Auto-Fetch] Error:', err);
        }
      }, 10 * 60 * 1000);
    } catch (err: any) {
      console.error(`❌ CRITICAL: PostgreSQL connection failed on startup: ${err.message}`);
    }
  });
}

export default app;
// Reloaded for OTP proofing & Gmail notifications (From Name: Opti CRM)
