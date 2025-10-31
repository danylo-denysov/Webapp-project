import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class UpdateListOrdersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
