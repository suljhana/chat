import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AI API Keys
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  
  // Pipedream config
  pipedreamProjectId: process.env.PIPEDREAM_PROJECT_ID || '',
  pipedreamClientId: process.env.PIPEDREAM_CLIENT_ID || '',
  pipedreamClientSecret: process.env.PIPEDREAM_CLIENT_SECRET || '',
  pipedreamApiUrl: process.env.PIPEDREAM_API_URL || 'https://api.pipedream.com',
  
  // CORS settings
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8081',
};

export const hasValidAPIKeys = () => {
  return !!(config.openaiApiKey || config.anthropicApiKey || config.googleApiKey);
};