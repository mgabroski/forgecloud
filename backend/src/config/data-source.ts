import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';

import { User } from '../modules/users/user.entity';
import { Organization } from '../modules/organizations/organization.entity';
import { OrganizationMembership } from '../modules/organizations/organization-membership.entity';
import { Project } from '../modules/projects/project.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,

  // 👇 Explicitly register entities so CLI definitely sees them
  entities: [User, Organization, OrganizationMembership, Project],

  // For migrations when using ts-node / src/ as base
  migrations: ['src/migrations/*.{ts,js}'],
});
