import { useState, useEffect, useCallback } from 'react';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';

export interface Notification {
  id: string;
  type: 'mention' | 'assignment';
  content: string;
  sent_at: string;
  task?: {
    id: string;
    title: string;
    taskGroup: {
      id: string;
      name: string;
      board: {
        id: string;
        name: string;
      };
    };
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await safe_fetch('/api/users/me/notifications', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        await handleApiError(response);
        return;
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
  };
}
