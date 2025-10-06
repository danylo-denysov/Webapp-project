import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class UpdateGroupOrdersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
