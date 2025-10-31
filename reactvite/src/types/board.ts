export interface Board {
  id: string;
  name: string;
  created_at: string;
  owner: { id: string; username: string };
  color?: string;
}

export type SortOption = 'name' | 'date' | 'owner';
