import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../organizations/organization.entity';
import { Project } from '../projects/project.entity';
import { LogEntry } from './log-entry.entity';

export enum LogSourceType {
  SERVICE = 'service',
  AUDIT = 'audit',
  JOB = 'job',
  OTHER = 'other',
}

export enum LogSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('log_sources')
export class LogSource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // --- Multi-tenant scoping ---

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project: Project | null = null;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null = null;

  // --- Source metadata ---

  @Column({ type: 'varchar', length: 191 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: LogSourceType;

  @Column({ type: 'varchar', length: 50, default: LogSourceStatus.ACTIVE })
  status!: LogSourceStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  environment: string | null = null;

  // Ready for future ingest-key auth
  @Column({ name: 'ingest_key', type: 'varchar', length: 255, nullable: true })
  ingestKey: string | null = null;

  // --- Relations ---

  @OneToMany(() => LogEntry, (entry) => entry.source)
  logEntries!: LogEntry[];

  // --- Timestamps ---

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
