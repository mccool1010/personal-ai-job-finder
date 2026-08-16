import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  secretKey: process.env.SECRET_KEY || 'dev-secret-key',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Adzuna
  adzunaAppId: process.env.ADZUNA_APP_ID || '',
  adzunaAppKey: process.env.ADZUNA_APP_KEY || '',

  // LLM (optional)
  llmApiKey: process.env.LLM_API_KEY || '',
  llmProvider: process.env.LLM_PROVIDER || 'gemini',

  // Derived flags
  get hasDatabase() {
    return !!this.databaseUrl && this.databaseUrl !== 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/job-finder?retryWrites=true&w=majority';
  },
  get hasAdzuna() {
    return !!this.adzunaAppId && !!this.adzunaAppKey;
  },
  get hasLLM() {
    return !!this.llmApiKey;
  },

  // Limits
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // requests per window
  jobCacheTTL: 6 * 60 * 60 * 1000, // 6 hours
};

// Startup validation
export function validateConfig() {
  const warnings = [];
  const errors = [];

  if (!config.hasDatabase) {
    warnings.push('DATABASE_URL not set — using in-memory storage (data will not persist across restarts)');
  }
  if (!config.hasAdzuna) {
    warnings.push('ADZUNA_APP_ID/KEY not set — Adzuna adapter disabled. Register free at https://developer.adzuna.com');
  }
  if (!config.hasLLM) {
    warnings.push('LLM_API_KEY not set — AI features (cover letter, smart explanations) disabled. Deterministic matching still works.');
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Configuration warnings:');
    warnings.forEach(w => console.log(`   • ${w}`));
    console.log('');
  }
  if (errors.length > 0) {
    console.error('\n❌ Configuration errors:');
    errors.forEach(e => console.error(`   • ${e}`));
    process.exit(1);
  }
}

export default config;
