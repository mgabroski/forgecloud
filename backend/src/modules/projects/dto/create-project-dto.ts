import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProjectVisibility } from '../project.entity';

export class CreateProjectDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  key!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectVisibility)
  visibility?: ProjectVisibility;
}
