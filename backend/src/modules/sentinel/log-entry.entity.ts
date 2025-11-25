import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../organizations/organization.entity';
import { Project } from '../projects/project.entity';
import { LogSource } from './log-source.entity';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Entity('log_entries')
export class LogEntry {
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

  @ManyToOne(() => LogSource, (source) => source.logEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'source_id' })
  source!: LogSource;

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId!: string;

  // --- Core log data ---

  @Column({ type: 'timestamptz' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 20 })
  level!: LogLevel;

  @Column({ type: 'text' })
  message!: string;

  // Arbitrary structured context, e.g. request info, userId, etc.
  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, unknown> | null = null;

  // Optional extra metadata for future use (traceId, spanId, etc.)
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null = null;

  // --- Timestamps ---

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
