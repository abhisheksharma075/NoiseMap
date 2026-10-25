import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleChatApiRequest, handleProviderSessionRequest } from './server/chatHandler.js';

function aiCopilotPlugin(): Plugin {
  return {
    name: 'noisemap-ai-copilot-plugin',
    configureServer(server) {
      server.middlewares.use('/api/copilot/provider-session', async (req, res) => {
        await handleProviderSessionRequest(req, res);
      });
      server.middlewares.use('/api/chat', async (req, res) => {
        await handleChatApiRequest(req, res);
      });
      server.middlewares.use('/api/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            service: 'NoiseMap AI Copilot API',
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY),
          })
        );
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/copilot/provider-session', async (req, res) => {
        await handleProviderSessionRequest(req, res);
      });
      server.middlewares.use('/api/chat', async (req, res) => {
        await handleChatApiRequest(req, res);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables server-side for backend API handling
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of Object.keys(env)) {
    if (!process.env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), aiCopilotPlugin()],
    server: {
      port: 5173,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-leaflet': ['leaflet', 'react-leaflet'],
            'vendor-pdf': ['pdf-lib'],
            'vendor-charts': ['chart.js', 'react-chartjs-2'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
