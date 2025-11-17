import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Organization, OrganizationPlan } from './organization.entity';

export class OrganizationRepository {
  private repo: Repository<Organization>;

  constructor() {
    this.repo = AppDataSource.getRepository(Organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.repo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<Organization | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Explicit factory for creating organizations.
   * Ensures all mandatory fields are set.
   */
  async createOrganization(
    userId: string,
    dto: { name: string; slug: string },
  ): Promise<Organization> {
    const org = this.repo.create({
      name: dto.name,
      slug: dto.slug,
      plan: OrganizationPlan.FREE,
      isActive: true,
      createdByUserId: userId,
      ownerUserId: userId,
    });

    return this.repo.save(org);
  }

  /**
   * Generic save, used for updates.
   */
  async save(org: Partial<Organization>): Promise<Organization> {
    return this.repo.save(org);
  }
}

export const organizationRepository = new OrganizationRepository();
