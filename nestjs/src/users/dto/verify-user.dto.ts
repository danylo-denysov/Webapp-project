import { IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
