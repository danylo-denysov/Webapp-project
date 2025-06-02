import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateTaskGroupDto {
  @ApiProperty({
    description: 'New name for the Task Group (optional)',
    example: 'In Progress',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
