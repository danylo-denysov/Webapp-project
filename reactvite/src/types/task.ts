/**
 * Task-related type definitions
 */

export interface TaskListItem {
  id: string;
  content: string;
  completed: boolean;
  order: number;
  created_at: string;
}

export interface TaskList {
  id: string;
  name: string;
  order: number;
  created_at: string;
  items: TaskListItem[];
}

export interface TaskComment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    email: string;
    profile_picture?: string | null;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  created_at: string;
  order: number;
  taskLists?: TaskList[];
  comments?: TaskComment[];
  taskGroup?: {
    id: string;
    name: string;
    board: {
      id: string;
    };
  };
}

export interface TaskGroup {
  id: string;
  name: string;
  created_at: string;
  order: number;
  tasks: Task[];
}
