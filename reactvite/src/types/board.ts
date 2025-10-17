export interface Board {
  id: string;
  name: string;
  created_at: string;
  owner: { id: string; username: string };
}

export type SortOption = 'name' | 'date' | 'owner';
