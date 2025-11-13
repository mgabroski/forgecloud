import { Router } from 'express';

import { AppDataSource } from '../config/data-source';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  try {
    await AppDataSource.query('SELECT 1');

    return res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('DB health check failed:', error);

    return res.status(500).json({
      status: 'error',
      db: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});
