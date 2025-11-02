import { useState, useCallback } from 'react';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import type { TaskComment } from '../../types/task';

export function useTaskComments() {
  const [loading, setLoading] = useState(false);

  const createComment = useCallback(async (taskId: string, content: string): Promise<TaskComment | null> => {
    setLoading(true);
    try {
      const res = await safe_fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        await handleApiError(res);
        return null;
      }

      const comment = await res.json();
      return comment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await safe_fetch(`/api/tasks/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        await handleApiError(res);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createComment,
    deleteComment,
    loading,
  };
}
