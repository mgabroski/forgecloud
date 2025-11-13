import express from 'express';
import cors from 'cors';

import { healthRouter } from './routes/health.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use(healthRouter);

  // Simple root ping
  app.get('/', (_req, res) => {
    res.json({ message: 'ForgeCloud backend is running' });
  });

  return app;
}
