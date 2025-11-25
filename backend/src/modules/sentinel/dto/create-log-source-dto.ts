import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LogSourceStatus, LogSourceType } from '../log-source.entity';

export class CreateLogSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(LogSourceType)
  type!: LogSourceType;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsEnum(LogSourceStatus)
  status?: LogSourceStatus;
}
