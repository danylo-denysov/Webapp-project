import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BoardUserRole } from '../board-user-role.enum';

export class UpdateBoardUserRoleDto {
  @ApiProperty({
    description: 'Role to assign to the user on this board',
    enum: BoardUserRole,
    example: BoardUserRole.EDITOR,
  })
  @IsEnum(BoardUserRole, {
    message: 'Role must be one of: Owner, Editor, or Viewer',
  })
  role: BoardUserRole;
}
