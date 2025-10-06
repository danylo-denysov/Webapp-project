import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangeNicknameDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  newNickname: string;
}
