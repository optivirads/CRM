import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
const isSsl = process.env.DB_SSL !== 'false';

// Sanitize or auto-complete connection configuration
function buildPoolConfig() {
  if (rawDatabaseUrl) {
    return {
      connectionString: rawDatabaseUrl,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };
}

export const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle client in PostgreSQL pool:', err.message);
});

export const db = {
  query: async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`[Slow Query ${duration}ms]: ${text.slice(0, 100)}...`);
    }
    return res;
  },

  getClient: async (): Promise<PoolClient> => {
    return await pool.connect();
  },

  getDiagnostics: () => {
    const usingUrl = Boolean(rawDatabaseUrl);
    let configuredHost = process.env.DB_HOST || 'localhost';
    let configuredUser = process.env.DB_USER || 'postgres';

    if (usingUrl && rawDatabaseUrl) {
      try {
        const parsed = new URL(rawDatabaseUrl);
        configuredHost = parsed.hostname;
        configuredUser = parsed.username;
      } catch {
        configuredHost = 'unparseable_url';
        configuredUser = 'unparseable_url';
      }
    }

    return {
      usingConnectionString: usingUrl,
      configuredHost,
      configuredUser,
      isSupabasePooler: configuredHost.includes('pooler.supabase.com'),
      userHasPoolerTenant: configuredUser.includes('.'),
      sslEnabled: isSsl,
      hasPassword: Boolean(process.env.DB_PASSWORD || (rawDatabaseUrl && rawDatabaseUrl.includes(':'))),
      envDatabaseUrlSet: usingUrl,
      envDbHostSet: Boolean(process.env.DB_HOST),
      envDbUserSet: Boolean(process.env.DB_USER),
      envDbPasswordSet: Boolean(process.env.DB_PASSWORD)
    };
  }
};
