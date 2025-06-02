import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RenameBoardDto {
  @ApiProperty({
    description: 'The new name for the existing Board',
    example: 'Q3 Development Plan',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
