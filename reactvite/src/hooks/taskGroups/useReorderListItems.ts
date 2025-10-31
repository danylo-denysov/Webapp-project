import { useState } from 'react';
import { safe_fetch } from '../../utils/api';

export function useReorderListItems() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderItems = async (listId: string, itemIds: string[]): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await safe_fetch(`/api/tasks/lists/${listId}/items/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: itemIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder list items');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder list items';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { reorderItems, isLoading, error };
}
