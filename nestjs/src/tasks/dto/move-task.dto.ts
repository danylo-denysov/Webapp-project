import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class MoveTaskDto {
  @IsNotEmpty()
  @IsUUID('4')
  targetGroupId!: string;

  @IsNumber()
  @Min(0)
  newOrder!: number;
}
