import { safe_fetch } from '../../utils/api';

export function useReorderTaskLists() {
  const reorderLists = async (taskId: string, listIds: string[]): Promise<void> => {
    const response = await safe_fetch(`/api/tasks/${taskId}/lists/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: listIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder lists');
    }
  };

  return { reorderLists };
}
