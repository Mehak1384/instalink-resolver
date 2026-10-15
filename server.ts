import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveInstagramInput } from './src/lib/instagramValidator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Strict body limit (64kb) to prevent payload-based memory exhaustion
app.use(express.json({ limit: '64kb' }));

// Security Headers Middleware (Defense in Depth)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self';"
  );
  next();
});

// Privacy-preserving in-memory operational metrics
const operationalMetrics = {
  totalResolutions: 0,
  successfulLookups: 0,
  validationErrors: 0,
  rateLimitHits: 0,
  startTime: new Date().toISOString(),
};

// In-Memory Sliding-Window Rate Limiter
interface RateLimitBucket {
  timestamps: number[];
}
const rateLimitStore = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per min

// Periodic memory cleanup for stale rate limiter entries (every 5 mins)
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitStore.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (bucket.timestamps.length === 0) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  // Use connection remoteAddress or trusted forward for local dev
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let bucket = rateLimitStore.get(clientIp);
  if (!bucket) {
    bucket = { timestamps: [] };
    rateLimitStore.set(clientIp, bucket);
  }

  // Filter out expired timestamps
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - bucket.timestamps.length).toString());

  if (bucket.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    operationalMetrics.rateLimitHits++;
    res.setHeader('Retry-After', '60');
    res.status(429).json({
      error: 'Too many requests. Please wait before trying again.',
      code: 'RATE_LIMIT_EXCEEDED',
      retry_after_seconds: 60,
    });
    return;
  }

  bucket.timestamps.push(now);
  next();
}

// -------------------------------------------------------------
// Health Check Endpoints (PRD Section 12.2 & 12.3)
// -------------------------------------------------------------

app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  res.status(200).json({
    status: 'ready',
    uptime_seconds: Math.floor(process.uptime()),
    checks: {
      memory: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'degraded',
      rate_limiter: 'healthy',
      stateless_core: 'healthy',
    },
  });
});

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/v1/metrics', (_req: Request, res: Response) => {
  res.status(200).json({
    ...operationalMetrics,
    uptime_seconds: Math.floor(process.uptime()),
    active_rate_limit_clients: rateLimitStore.size,
  });
});

// Endpoint: POST /api/v1/resolve (PRD Section 12.1)
app.post('/api/v1/resolve', rateLimiter, (req: Request, res: Response) => {
  operationalMetrics.totalResolutions++;

  // Validate Content-Type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    res.status(415).json({
      error: 'Unsupported Media Type. Request header Content-Type must be application/json.',
      code: 'UNSUPPORTED_CONTENT_TYPE',
    });
    return;
  }

  // Validate request body structure
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({
      error: 'Malformed request. JSON body required.',
      code: 'MALFORMED_REQUEST',
    });
    return;
  }

  const { query } = req.body;
  if (typeof query !== 'string') {
    res.status(400).json({
      error: 'Field "query" is required and must be a string.',
      code: 'INVALID_QUERY_TYPE',
    });
    return;
  }

  // Execute canonical resolution and validation
  const resolution = resolveInstagramInput(query);

  if (!resolution.isValid) {
    operationalMetrics.validationErrors++;
    res.status(422).json({
      error: resolution.error,
      code: resolution.code,
    });
    return;
  }

  operationalMetrics.successfulLookups++;

  // PRD 12.1 Response Schema:
  // Strictly specifies: link_constructed and verified: false
  res.status(200).json({
    username: resolution.username,
    profile_url: resolution.profileUrl,
    app_deep_link: resolution.appDeepLink,
    status: resolution.status,
    verified: resolution.verified,
    input_format: resolution.inputFormat,
  });
});

// -------------------------------------------------------------
// Dev & Production Vite Middleware Mount
// -------------------------------------------------------------

async function bootstrap() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[InstaLink] Server initialized on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
