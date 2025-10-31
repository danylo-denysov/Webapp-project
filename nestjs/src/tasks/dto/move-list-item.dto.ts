import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveListItemDto {
  @IsUUID('4')
  targetListId!: string;

  @IsInt()
  @Min(0)
  newOrder!: number;
}
