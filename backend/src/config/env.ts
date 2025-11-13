import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || 'forgecloud',
  DB_PASSWORD: process.env.DB_PASSWORD || 'forgecloud',
  DB_NAME: process.env.DB_NAME || 'forgecloud',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
};
