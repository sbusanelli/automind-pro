import { logger } from '../utils/logger';

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  DB_PATH: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  LOG_LEVEL: string;
  BCRYPT_ROUNDS: number;
}

const requiredEnvVars: (keyof EnvironmentConfig)[] = [
  'NODE_ENV',
  'PORT', 
  'FRONTEND_URL',
  'DB_PATH',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'LOG_LEVEL',
  'BCRYPT_ROUNDS'
];

const validateEnvironment = (): EnvironmentConfig => {
  const missingVars: string[] = [];
  
  // Check for missing required environment variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file or environment configuration.'
    );
  }
  
  // Validate specific values
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
  
  if (process.env.BCRYPT_ROUNDS && parseInt(process.env.BCRYPT_ROUNDS) < 10) {
    throw new Error('BCRYPT_ROUNDS must be at least 10 for secure password hashing');
  }
  
  const config: EnvironmentConfig = {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: parseInt(process.env.PORT!),
    FRONTEND_URL: process.env.FRONTEND_URL!,
    DB_PATH: process.env.DB_PATH!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
    LOG_LEVEL: process.env.LOG_LEVEL!,
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS!)
  };
  
  logger.info('Environment validation successful', {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    dbPath: config.DB_PATH,
    jwtSecretLength: config.JWT_SECRET.length,
    bcryptRounds: config.BCRYPT_ROUNDS
  });
  
  return config;
};

export { validateEnvironment, EnvironmentConfig };
