import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailOnMention?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnAssignment?: boolean;

  @IsOptional()
  @IsBoolean()
  webhookOnMention?: boolean;

  @IsOptional()
  @IsBoolean()
  webhookOnAssignment?: boolean;

  @IsOptional()
  @IsString()
  @IsUrl()
  webhookUrl?: string | null;
}
