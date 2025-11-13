import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { OrganizationMembership } from '../organizations/organization-membership.entity';
import { Project } from '../projects/project.entity';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    name: 'auth_provider',
    default: AuthProvider.LOCAL,
  })
  authProvider!: AuthProvider;

  @Column({ name: 'full_name', type: 'varchar', nullable: true })
  fullName!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relations

  @OneToMany(() => OrganizationMembership, (membership) => membership.user)
  memberships!: OrganizationMembership[];

  @OneToMany(() => Organization, (org) => org.ownerUser)
  organizationsOwned!: Organization[];

  @OneToMany(() => Project, (project) => project.creator)
  projectsCreated!: Project[];

  @OneToMany(() => Project, (project) => project.lastUpdatedBy)
  projectsLastUpdated!: Project[];
}
