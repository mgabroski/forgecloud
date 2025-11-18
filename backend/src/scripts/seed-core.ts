import 'reflect-metadata';

import argon2 from 'argon2';

import { AppDataSource } from '../config/data-source';
import { User, AuthProvider } from '../modules/users/user.entity';
import { Organization, OrganizationPlan } from '../modules/organizations/organization.entity';
import {
  OrganizationMembership,
  OrganizationMembershipStatus,
  OrganizationRole,
} from '../modules/organizations/organization-membership.entity';
import { Project, ProjectStatus, ProjectVisibility } from '../modules/projects/project.entity';

async function seed() {
  console.log('🌱 Starting core seed...');

  await AppDataSource.initialize();
  console.log('✅ DataSource initialized');

  const userRepo = AppDataSource.getRepository(User);
  const orgRepo = AppDataSource.getRepository(Organization);
  const membershipRepo = AppDataSource.getRepository(OrganizationMembership);
  const projectRepo = AppDataSource.getRepository(Project);

  // 1) Seed user
  const seedEmail = 'founder@forgecloud.dev';
  const seedPassword = 'ForgeCloud#123';

  let user = await userRepo.findOne({ where: { email: seedEmail } });

  if (!user) {
    const passwordHash = await argon2.hash(seedPassword);

    user = userRepo.create({
      email: seedEmail,
      passwordHash: passwordHash,
      authProvider: AuthProvider.LOCAL,
      fullName: 'ForgeCloud Founder',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
    });

    user = await userRepo.save(user);
    console.log('👤 Created user:', user.email);
  } else {
    console.log('👤 User already exists:', user.email);
  }

  // 2) Seed organization
  const orgSlug = 'forgecloud-labs';

  let organization = await orgRepo.findOne({ where: { slug: orgSlug } });

  if (!organization) {
    organization = orgRepo.create({
      name: 'ForgeCloud Labs',
      slug: orgSlug,
      plan: OrganizationPlan.FREE,
      isActive: true,
      ownerUserId: user.id,
      createdByUserId: user.id,
    });

    organization = await orgRepo.save(organization);
    console.log('🏢 Created organization:', organization.name);
  } else {
    console.log('🏢 Organization already exists:', organization.name);
  }

  // 3) Seed organization membership
  let membership = await membershipRepo.findOne({
    where: {
      userId: user.id,
      organizationId: organization.id,
    },
  });

  if (!membership) {
    membership = membershipRepo.create({
      userId: user.id,
      organizationId: organization.id,
      role: OrganizationRole.OWNER,
      status: OrganizationMembershipStatus.ACTIVE,
      invitedByUserId: null,
      invitedAt: null,
      joinedAt: new Date(),
    });

    membership = await membershipRepo.save(membership);
    console.log('🔗 Created organization membership (OWNER)');
  } else {
    console.log('🔗 Membership already exists for user & organization');
  }

  // 4) Seed project
  const projectKey = 'CORE';

  let project = await projectRepo.findOne({
    where: {
      organizationId: organization.id,
      key: projectKey,
    },
  });

  if (!project) {
    project = projectRepo.create({
      organizationId: organization.id,
      name: 'ForgeCloud Core Platform',
      key: projectKey,
      description: 'Core platform project for ForgeCloud monorepo.',
      status: ProjectStatus.ACTIVE,
      visibility: ProjectVisibility.PRIVATE,
      createdByUserId: user.id,
      lastUpdatedByUserId: user.id,
    });

    project = await projectRepo.save(project);
    console.log('📁 Created project:', project.name);
  } else {
    console.log('📁 Project already exists:', project.name);
  }

  await AppDataSource.destroy();
  console.log('✅ Seed completed. Connection closed.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  AppDataSource.destroy().finally(() => process.exit(1));
});
