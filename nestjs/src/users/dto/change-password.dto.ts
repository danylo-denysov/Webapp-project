import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The user’s current (old) password',
    example: 'OldP@ssw0rd',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'The new password (minimum 8 characters)',
    example: 'N3wS3cur3P@ss',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Repeat the new password exactly for confirmation',
    example: 'N3wS3cur3P@ss',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  repeatPassword: string;
}
