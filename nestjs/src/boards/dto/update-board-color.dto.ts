import { IsString, Matches } from 'class-validator';

export class UpdateBoardColorDto {
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  color: string;
}
