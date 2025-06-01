import { useCallback } from 'react';

export function useReorderTasks() {
  return useCallback(
    async (groupId: string, newOrder: string[]) => {
      const token = localStorage.getItem('token');
      await fetch(
        `/api/tasks/group/${groupId}/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: newOrder }),
        }
      );
    },
    []
  );
}
