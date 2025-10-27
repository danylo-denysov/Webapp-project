import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskListDto {
  @IsOptional()
  @IsString()
  name?: string;
}
