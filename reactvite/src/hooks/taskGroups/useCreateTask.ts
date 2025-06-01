import { toast } from 'react-toastify';
import type { Task } from '../taskGroups/useTaskGroups';
import { toastError, toastSuccess } from '../../utils/toast';

export function useCreateTask(
  groupId: string,
  onAdded?: (task: Task) => void
) {
  const createTask = async (title: string, description: string) => {
    if (!title.trim() || !description.trim()) {
      return toastError('All fields required');
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, description, groupId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return toastError(data.message ?? 'Failed to create task');
      }
      toastSuccess('Task added');
      onAdded?.(data as Task);
    } catch (err) {
      console.error(err);
      toastError('Failed to create task');
    }
  };

  return { createTask };
}
