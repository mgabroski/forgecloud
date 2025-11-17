import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const NODE_ENV = process.env.NODE_ENV || 'development';
const isTest = NODE_ENV === 'test';

// Base (non-test) DB name
const baseDbName = process.env.DB_NAME || 'forgecloud';

// Effective DB name (switches in test mode)
const effectiveDbName = isTest ? process.env.DB_NAME_TEST || `${baseDbName}_test` : baseDbName;

export const env = {
  NODE_ENV,
  PORT: Number(process.env.PORT || 4000),

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || 'forgecloud',
  DB_PASSWORD: process.env.DB_PASSWORD || 'forgecloud',

  // 👇 This is the one TypeORM will use (dev/prod or test)
  DB_NAME: effectiveDbName,

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),

  JWT_SECRET: process.env.JWT_SECRET || 'forgecloud-dev-secret',
};
