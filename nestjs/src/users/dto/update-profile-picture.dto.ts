import { IsString } from 'class-validator';

export class UpdateProfilePictureDto {
  @IsString()
  profilePicture: string;
}
