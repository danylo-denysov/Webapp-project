import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeNicknameDto {
  @ApiProperty({
    description: 'The new nickname (username) to assign to the current user',
    example: 'new_username',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  newNickname: string;
}
