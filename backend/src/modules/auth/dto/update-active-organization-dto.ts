import { IsOptional, IsUUID } from 'class-validator';

export class UpdateActiveOrganizationDto {
  /**
   * The organization to activate as current workspace.
   *
   * If omitted (undefined), we will interpret it as "clear active org"
   * in the service by mapping `dto.organizationId ?? null`.
   */
  @IsUUID('4', { message: 'organizationId must be a valid UUID' })
  @IsOptional()
  organizationId?: string;
}
