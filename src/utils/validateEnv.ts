import { logger } from './logger';
import { MONGODB_URI, PORT, NODE_ENV } from '../config';

export const ValidateEnv = (): void => {
  const requiredEnvVars = [
    { key: 'MONGODB_URI', value: MONGODB_URI },
    { key: 'PORT', value: PORT },
    { key: 'NODE_ENV', value: NODE_ENV },
  ];

  const missingVars = requiredEnvVars.filter((env) => !env.value);

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.map((v) => v.key).join(', ')}`);
    process.exit(1);
  }

  logger.info('✅ Environment variables validated successfully');
};
