import { IsEnum } from 'class-validator';
import { BoardUserRole } from '../board-user-role.enum';

export class UpdateBoardUserRoleDto {
  @IsEnum(BoardUserRole, {
    message: 'Role must be one of: Owner, Editor, or Viewer',
  })
  role: BoardUserRole;
}
