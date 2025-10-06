import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateTaskGroupDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
