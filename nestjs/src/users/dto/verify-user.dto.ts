import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
