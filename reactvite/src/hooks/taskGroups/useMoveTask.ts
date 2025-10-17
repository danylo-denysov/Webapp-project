import { useState } from 'react';
import { safe_fetch } from '../../utils/api';

export function useMoveTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveTask = async (taskId: string, targetGroupId: string, newOrder: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await safe_fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetGroupId, newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to move task');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move task';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { moveTask, isLoading, error };
}
