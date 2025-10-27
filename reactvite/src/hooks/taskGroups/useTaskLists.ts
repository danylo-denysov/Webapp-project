import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { toastError, toastSuccess } from '../../utils/toast';
import type { TaskList, TaskListItem } from '../../types/task';

export function useTaskLists() {
  const createList = async (taskId: string, name: string): Promise<TaskList | null> => {
    if (!name.trim()) {
      toastError('List name is required');
      return null;
    }

    try {
      const res = await safe_fetch('/api/tasks/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, name }),
      });
      if (!res.ok) {
        await handleApiError(res);
        return null;
      }
      const data = await res.json();
      toastSuccess('List created');
      return data as TaskList;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return null;
    }
  };

  const deleteList = async (listId: string): Promise<boolean> => {
    try {
      const res = await safe_fetch(`/api/tasks/lists/${listId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
        return false;
      }
      toastSuccess('List deleted');
      return true;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return false;
    }
  };

  const createItem = async (taskListId: string, content: string): Promise<TaskListItem | null> => {
    if (!content.trim()) {
      toastError('Item content is required');
      return null;
    }

    try {
      const res = await safe_fetch('/api/tasks/lists/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskListId, content }),
      });
      if (!res.ok) {
        await handleApiError(res);
        return null;
      }
      const data = await res.json();
      return data as TaskListItem;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return null;
    }
  };

  const toggleItem = async (itemId: string, completed: boolean): Promise<TaskListItem | null> => {
    try {
      const res = await safe_fetch(`/api/tasks/lists/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) {
        await handleApiError(res);
        return null;
      }
      const data = await res.json();
      return data as TaskListItem;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return null;
    }
  };

  const deleteItem = async (itemId: string): Promise<boolean> => {
    try {
      const res = await safe_fetch(`/api/tasks/lists/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        await handleApiError(res);
        return false;
      }
      return true;
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
      return false;
    }
  };

  return { createList, deleteList, createItem, toggleItem, deleteItem };
}
