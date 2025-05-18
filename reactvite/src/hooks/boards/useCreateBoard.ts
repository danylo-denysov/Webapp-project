import { useState } from 'react';
import { toast } from 'react-toastify';
import { Board } from './useBoards';

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
      toast.error('Name cannot be empty');
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
      toast.success('Board created');
      onSuccess?.(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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
