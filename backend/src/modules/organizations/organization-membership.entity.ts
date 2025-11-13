import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Organization } from './organization.entity';

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum OrganizationMembershipStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('organization_memberships')
@Unique('uq_org_membership_user_org', ['userId', 'organizationId'])
export class OrganizationMembership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER,
  })
  role!: OrganizationRole;

  @Column({
    type: 'enum',
    enum: OrganizationMembershipStatus,
    default: OrganizationMembershipStatus.INVITED,
  })
  status!: OrganizationMembershipStatus;

  @Column({ name: 'invited_by_user_id', type: 'uuid', nullable: true })
  invitedByUserId!: string | null;

  @Column({ name: 'invited_at', type: 'timestamptz', nullable: true })
  invitedAt!: Date | null;

  @Column({ name: 'joined_at', type: 'timestamptz', nullable: true })
  joinedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Organization, (org) => org.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by_user_id' })
  invitedByUser!: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
