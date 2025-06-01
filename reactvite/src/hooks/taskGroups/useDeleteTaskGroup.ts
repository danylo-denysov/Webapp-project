import { toast } from 'react-toastify';
import { useState } from 'react';
import { toastError } from '../../utils/toast';

export function useDeleteTaskGroup(boardId: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const remove = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/boards/${boardId}/task-groups/${id}`, {
        method : 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete group');
      toast.success('Group deleted');
      onSuccess?.();
    } catch (e: any) {
      toastError(e.message || 'Failed to delete group');
    } finally { setLoading(false); }
  };

  return { remove, loading };
}
