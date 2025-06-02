import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyUserDto {
  @ApiProperty({
    description: 'Email address used to verify/login',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password corresponding to the email',
    example: 'S3cur3P@ssw0rd',
  })
  @IsNotEmpty()
  password: string;
}
