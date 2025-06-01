import { useState } from 'react';
import { toast } from 'react-toastify';
import { Board } from './useBoards';
import { toastError, toastSuccess } from '../../utils/toast';

interface UseCreateBoardOptions {
  onSuccess?: (newBoard: Board) => void;
}

export function useCreateBoard({ onSuccess }: UseCreateBoardOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const createBoard = async (name: string) => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      toastError('Board name cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/boards/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create board');
      }
      toastSuccess('Board created');
      onSuccess?.(data);
    } catch (err: any) {
      setError(err.message);
      toastError(err.message || 'Failed to create board');
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
