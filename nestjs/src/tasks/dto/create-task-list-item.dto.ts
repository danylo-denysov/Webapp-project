import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskListItemDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  taskListId: string;
}
