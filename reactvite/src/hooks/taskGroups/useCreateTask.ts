import type { Task } from '../../types/task';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { toastError, toastSuccess } from '../../utils/toast';

export function useCreateTask(
  groupId: string,
  onAdded?: (task: Task) => void
) {
  const createTask = async (title: string) => {
    if (!title.trim()) {
      return toastError('Task name is required');
    }

    try {
      const res = await safe_fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: '', groupId }),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      const data = await res.json();
      toastSuccess('Task added');
      onAdded?.(data as Task);
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
    }
  };

  return { createTask };
}
