import { useState, useEffect } from 'react';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';

export interface NotificationPreferences {
  id: string;
  emailOnMention: boolean;
  emailOnAssignment: boolean;
  webhookOnMention: boolean;
  webhookOnAssignment: boolean;
  webhookUrl: string | null;
  created_at: string;
  updated_at: string;
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await safe_fetch('/api/users/me/notification-preferences', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        await handleApiError(response);
        return;
      }

      const data = await response.json();
      setPreferences(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const response = await safe_fetch('/api/users/me/notification-preferences', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        await handleApiError(response);
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refresh: fetchPreferences,
  };
}
