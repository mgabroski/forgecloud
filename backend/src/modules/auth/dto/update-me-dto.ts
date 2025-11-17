import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(512)
  avatarUrl?: string;
}
