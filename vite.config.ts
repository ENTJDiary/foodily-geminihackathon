import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Get API key from environment variable
  const geminiApiKey = env.GEMINI_API_KEY;

  // Validate that API key is available
  if (!geminiApiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables!');
    console.warn('📝 For local development: Make sure you have .env.local file with GEMINI_API_KEY');
    console.warn('🔧 For CI/CD: Set GEMINI_API_KEY in GitHub Secrets');
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
