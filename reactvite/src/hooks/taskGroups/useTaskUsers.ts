import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { toastError, toastSuccess } from '../../utils/toast';

export function useTaskUsers() {
  const assignUser = async (taskId: string, userId: string): Promise<boolean> => {
    try {
      const res = await safe_fetch(`/api/tasks/${taskId}/users/${userId}`, {
        method: 'POST',
      });
      if (!res.ok) {
        await handleApiError(res);
        return false;
      }
      toastSuccess('User assigned to task');
      return true;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return false;
    }
  };

  const removeUser = async (taskId: string, userId: string): Promise<boolean> => {
    try {
      const res = await safe_fetch(`/api/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
        return false;
      }
      toastSuccess('User removed from task');
      return true;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return false;
    }
  };

  return { assignUser, removeUser };
}
