import express from 'express';
import cors from 'cors';

import { healthRouter } from './routes/health.routes';
import { userRouter } from './modules/users/user.routes';
import { organizationRouter } from './modules/organizations/organization.routes';
import { projectRouter } from './modules/projects/project.routes';
import { authRouter } from './modules/auth/auth.routes';
import { sentinelRouter } from './modules/sentinel/sentinel.routes';
import { requestLoggingMiddleware } from './common/middleware/request-logging-middleware';

import { errorHandler } from './common/middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(requestLoggingMiddleware);

  // Routes
  app.use(healthRouter);
  app.use('/users', userRouter);
  app.use('/organizations', organizationRouter);
  app.use('/projects', projectRouter);
  app.use('/auth', authRouter);
  app.use('/sentinel', sentinelRouter);

  // Simple root ping
  app.get('/', (_req, res) => {
    res.json({ message: 'ForgeCloud backend is running' });
  });

  app.use(errorHandler);

  return app;
}
