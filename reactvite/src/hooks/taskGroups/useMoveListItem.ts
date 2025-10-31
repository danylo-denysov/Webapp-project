import { useState } from 'react';
import { safe_fetch } from '../../utils/api';

export function useMoveListItem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveItem = async (itemId: string, targetListId: string, newOrder: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await safe_fetch(`/api/tasks/lists/items/${itemId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetListId, newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to move list item');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move list item';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { moveItem, isLoading, error };
}
