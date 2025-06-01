import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class UpdateGroupOrdersDto {
  /** ordered list of group IDs (first = order 0, second = order 1, …) */
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
