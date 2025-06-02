import { toast } from 'react-toastify';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

export function useDeleteTask(onDeleted?: (id: string) => void) {
  const deleteTask = async (id: string) => {
    try {
      const res = await safe_fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        return toastError('Failed to delete');
      }
      toastSuccess('Task deleted');
      onDeleted?.(id);
    } catch (err) {
      console.error(err);
      toastError('Failed to delete');
    }
  };

  return { deleteTask };
}
