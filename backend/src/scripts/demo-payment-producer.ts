/* eslint-disable no-console */
import 'reflect-metadata';
import dotenv from 'dotenv';

import { AppDataSource } from '../config/data-source';
import { sentinelService } from '../modules/sentinel/sentinel.service';
import { LogSourceType } from '../modules/sentinel/log-source.entity';
import { LogLevel } from '../modules/sentinel/log-entry.entity';
import { User } from '../modules/users/user.entity';

dotenv.config();

async function getDemoUserId(): Promise<string> {
  const userRepo = AppDataSource.getRepository(User);

  // In dev we just pick the first user we find
  const user = await userRepo.findOne({
    where: {},
    order: { createdAt: 'ASC' },
  });

  if (!user) {
    console.error('No users found in database. Seed a user before running demo-payment-producer.');
    process.exit(1);
  }

  return user.id;
}

async function runOnce(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const demoUserId = await getDemoUserId();

    const source = await sentinelService.createSourceForUser(demoUserId, {
      name: 'demo-payment-service',
      type: LogSourceType.SERVICE,
      description: 'Demo external payment service emitting fake transactions',
      environment: 'demo',
    });

    const amount = (Math.random() * 100).toFixed(2);
    const status = Math.random() < 0.9 ? 'SUCCESS' : 'FAILED';

    await sentinelService.ingestLogForUser(demoUserId, {
      sourceId: source.id,
      level: status === 'SUCCESS' ? LogLevel.INFO : LogLevel.WARN,
      message: `Payment ${status} for $${amount}`,
      context: {
        amount,
        currency: 'USD',
        paymentId: `pay_${Date.now()}`,
        customerId: `cust_${Math.floor(Math.random() * 1000)}`,
      },
    });

    console.log('Demo payment log emitted');
  } finally {
    await AppDataSource.destroy();
  }
}

void runOnce().catch((err) => {
  console.error('Demo payment producer failed', err);
  process.exit(1);
});
