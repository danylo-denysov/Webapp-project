import { toast } from 'react-toastify';
import { toastError } from '../../utils/toast';

export function useDeleteTask(onDeleted?: (id: string) => void) {
  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        return toastError('Faile to delete;')
      }
      toast.success('Deleted');
      onDeleted?.(id);
    } catch (err) {
      console.error(err);
      toastError('Failed to delete');
    }
  };

  return { deleteTask };
}
