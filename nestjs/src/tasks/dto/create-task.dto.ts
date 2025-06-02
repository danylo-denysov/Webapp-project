import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Implement user login',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of what the task entails',
    example: 'Use JWT and Passport.js to authenticate users.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'UUID of the TaskGroup to which this task belongs',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  groupId: string;
}
