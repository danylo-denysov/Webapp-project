import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateTaskGroupDto {
  @ApiProperty({
    description: 'Name/title for the new Task Group',
    example: 'To Do',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'Optional initial order index (0-based). If omitted, the service will append at the end.',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
