import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectVisibility {
  PRIVATE = 'PRIVATE',
  INTERNAL = 'INTERNAL',
  PUBLIC = 'PUBLIC',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column()
  name!: string;

  // Short key unique within org, e.g. "CORE", "APP"
  @Column({ name: 'project_key' })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status!: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectVisibility,
    default: ProjectVisibility.PRIVATE,
  })
  visibility!: ProjectVisibility;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @Column({ name: 'last_updated_by_user_id', type: 'uuid', nullable: true })
  lastUpdatedByUserId!: string | null;

  @ManyToOne(() => Organization, (org) => org.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.projectsCreated, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_user_id' })
  creator!: User;

  @ManyToOne(() => User, (user) => user.projectsLastUpdated, {
    nullable: true,
  })
  @JoinColumn({ name: 'last_updated_by_user_id' })
  lastUpdatedBy!: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
