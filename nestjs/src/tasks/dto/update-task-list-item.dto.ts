import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskListItemDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
