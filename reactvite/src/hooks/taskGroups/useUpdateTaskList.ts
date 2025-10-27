import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { TaskList } from '../../types/task';

export function useUpdateTaskList() {
  const updateTaskList = async (listId: string, name: string): Promise<TaskList | null> => {
    try {
      const res = await safe_fetch(`/api/tasks/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        await handleApiError(res);
        return null;
      }
    } catch (error) {
      console.error('Failed to update task list:', error);
      return null;
    }
  };

  return { updateTaskList };
}
