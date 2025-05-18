import { IsEnum } from 'class-validator';
import { BoardUser } from '../board-user.entity';
import { BoardUserRole } from '../board-user-role.enum';

export class UpdateBoardUserRoleDto {
  @IsEnum(BoardUserRole, {
    message: 'Role must be either "Owner", "Editor", or "Viewer"',
  })
  role: BoardUserRole;
}
