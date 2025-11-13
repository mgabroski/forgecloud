import { createApp } from './app';
import { env } from './config/env';
import { AppDataSource } from './config/data-source';

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    // eslint-disable-next-line no-console
    console.log('✅ Database connected');

    const app = createApp();

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 ForgeCloud backend listening on port ${env.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
