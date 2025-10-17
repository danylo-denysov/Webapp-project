import { useState } from 'react';

import { Board } from '../../types/board';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { toastError, toastSuccess } from '../../utils/toast';

interface UseCreateBoardOptions {
  onSuccess?: (newBoard: Board) => void;
}

export function useCreateBoard({ onSuccess }: UseCreateBoardOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBoard = async (name: string) => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      toastError('Board name cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await safe_fetch('/api/boards/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        await handleApiError(res);
      }
      const data = await res.json();
      toastSuccess('Board created');
      onSuccess?.(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toastError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    createBoard,
    loading,
    error,
  };
}
