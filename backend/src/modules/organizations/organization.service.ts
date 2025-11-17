import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { organizationRepository } from './organization.repository';
import { organizationMembershipRepository } from './organization-membership.repository';
import { ValidationError } from '../../common/errors/validation-error';
import { Organization, OrganizationPlan } from './organization.entity';

export class OrganizationService {
  async getAllOrganizations(): Promise<Organization[]> {
    return organizationRepository.findAll();
  }

  async createOrganization(userId: string, dto: CreateOrganizationDto): Promise<Organization> {
    // Validate slug uniqueness
    const existing = await organizationRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ValidationError({ slug: 'Slug already taken' });
    }

    // Create org with owner + createdBy set to current user
    const organization = await organizationRepository.createOrganization(userId, {
      name: dto.name,
      slug: dto.slug,
    });

    // Auto-create owner membership
    await organizationMembershipRepository.createForOwner(userId, organization.id);

    return organization;
  }

  async updateOrganization(orgId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await organizationRepository.findById(orgId);
    if (!org) {
      throw new ValidationError({ organization: 'Not found' });
    }

    if (dto.name !== undefined) {
      org.name = dto.name;
    }

    if (dto.plan !== undefined) {
      org.plan = dto.plan as OrganizationPlan;
    }

    return organizationRepository.save(org);
  }
}

export const organizationService = new OrganizationService();
