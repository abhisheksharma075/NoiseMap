/**
 * NoiseMap AI Copilot - Standalone Production & Development Server
 * Runs an HTTP server providing the secure /api/chat and /api/health endpoints,
 * with optional static file serving and graceful termination.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { handleChatApiRequest, handleProviderSessionRequest } from './chatHandler.js';

// Minimal .env loader for standalone Node execution without external dependencies
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '3001', 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// MIME types for static assets if served from container
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer(async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // API endpoint: /api/chat
  if (url.pathname === '/api/chat') {
    await handleChatApiRequest(req, res);
    return;
  }

  // API endpoint: /api/copilot/provider-session
  if (url.pathname === '/api/copilot/provider-session') {
    await handleProviderSessionRequest(req, res);
    return;
  }

  // API endpoint: /api/health
  if (url.pathname === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'NoiseMap AI Copilot Backend (Stage 2)',
        version: '1.2.0',
        environment: process.env.NODE_ENV || 'development',
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Optional static file serving for containerized full-stack deployment
  if (req.method === 'GET' && fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!fs.existsSync(filePath)) {
      // SPA fallback
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[NoiseMap AI Copilot Server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`[NoiseMap AI Copilot Server] Health: GET http://0.0.0.0:${PORT}/api/health`);
  console.log(`[NoiseMap AI Copilot Server] Chat:   POST http://0.0.0.0:${PORT}/api/chat`);
});

// Graceful termination handling
const shutdown = () => {
  console.log('\n[NoiseMap AI Copilot Server] Gracefully shutting down...');
  server.close(() => {
    console.log('[NoiseMap AI Copilot Server] Server stopped cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;
