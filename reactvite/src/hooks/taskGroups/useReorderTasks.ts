import { useCallback } from 'react';
import { safe_fetch } from '../../utils/api';

export function useReorderTasks() {
  return useCallback(
    async (groupId: string, newOrder: string[]) => {
      const res = await safe_fetch(
        `/api/tasks/group/${groupId}/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: newOrder }),
        }
      );
      if (!res.ok) {
        throw new Error('Failed to reorder tasks');
      }
    },
    []
  );
}
