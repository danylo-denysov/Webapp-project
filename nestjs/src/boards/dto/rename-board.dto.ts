import { IsString, IsNotEmpty } from 'class-validator';

export class RenameBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
