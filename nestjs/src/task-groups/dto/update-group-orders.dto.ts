import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class UpdateGroupOrdersDto {
  @ApiProperty({
    description:
      'An array of TaskGroup IDs (UUIDs) in the new desired order. The first element → order 0, second → order 1, etc.',
    type: [String],
    example: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a1-7890-abcd-123456ef7890',
      'c3d4e5f6-a1b2-7890-abcd-234567ef8901',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
