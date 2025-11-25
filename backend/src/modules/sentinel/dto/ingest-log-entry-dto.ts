import { IsEnum, IsISO8601, IsObject, IsOptional, IsString } from 'class-validator';
import { LogLevel } from '../log-entry.entity';

export class IngestLogEntryDto {
  @IsString()
  sourceId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsISO8601()
  timestamp?: string;

  @IsEnum(LogLevel)
  level!: LogLevel;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
