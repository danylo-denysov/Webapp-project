import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaskOrder {
  @IsUUID('4') id!: string;
  @IsUUID('4') groupId!: string;
}

export class UpdateTaskOrdersDto {
  /** ordered lists of tasks for every group on the board */
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true }) @Type(() => TaskOrder)
  orders!: TaskOrder[];
}
