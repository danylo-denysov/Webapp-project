import type { Task } from '../../types/task';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { toastError, toastSuccess } from '../../utils/toast';

export function useUpdateTask(onUpdated?: (task: Task) => void) {
  const updateTask = async (taskId: string, updates: { title?: string; description?: string }) => {
    try {
      const res = await safe_fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      const data = await res.json();
      toastSuccess('Task updated');
      onUpdated?.(data as Task);
      return data as Task;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      throw error;
    }
  };

  return { updateTask };
}
