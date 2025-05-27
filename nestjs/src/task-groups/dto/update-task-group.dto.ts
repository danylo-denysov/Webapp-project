import { IsString, IsOptional, IsNotEmpty, IsInt, Min } from 'class-validator';

export class UpdateTaskGroupDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
