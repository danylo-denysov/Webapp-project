import { IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'password is too weak',
  // }) // 1 upper case letter, 1 lower case letter, 1 number or special character
  password: string; // In a real-world app, validate password strength
}
