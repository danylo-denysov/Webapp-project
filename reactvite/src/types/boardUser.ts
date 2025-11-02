export enum BoardUserRole {
  OWNER = 'Owner',
  EDITOR = 'Editor',
  VIEWER = 'Viewer',
}

export interface BoardUser {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    profile_picture?: string | null;
  };
  role: BoardUserRole;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profile_picture?: string | null;
}
