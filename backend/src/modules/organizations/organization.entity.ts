import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { OrganizationMembership } from './organization-membership.entity';
import { Project } from '../projects/project.entity';

export enum OrganizationPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({
    type: 'enum',
    enum: OrganizationPlan,
    default: OrganizationPlan.FREE,
  })
  plan!: OrganizationPlan;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId!: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @ManyToOne(() => User, (user) => user.organizationsOwned, {
    nullable: true,
  })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser!: User | null;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser!: User;

  @OneToMany(() => OrganizationMembership, (membership) => membership.organization)
  memberships!: OrganizationMembership[];

  @OneToMany(() => Project, (project) => project.organization)
  projects!: Project[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
