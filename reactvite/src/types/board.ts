/**
 * Board-related type definitions
 */

export interface Board {
  id: string;
  name: string;
  created_at: string;
  owner: { username: string };
}

export type SortOption = 'name' | 'date' | 'owner';
