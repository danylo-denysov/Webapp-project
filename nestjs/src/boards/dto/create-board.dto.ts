import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({
    description: 'Name/title for the new Board',
    example: 'Development Roadmap',
  })
  @IsNotEmpty()
  name: string;
}
