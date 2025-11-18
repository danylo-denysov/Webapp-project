import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationPreferences } from '../../hooks/notifications/useNotificationPreferences';
import { useNotifications } from '../../hooks/notifications/useNotifications';
import { toastSuccess, toastError } from '../../utils/toast';
import './NotificationsDropdown.css';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationsDropdown({ isOpen, onClose, buttonRef }: NotificationsDropdownProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { preferences, loading, updatePreferences } = useNotificationPreferences();
  const { notifications, loading: notificationsLoading, refresh: refreshNotifications } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  const handleNotificationClick = (boardId: string, taskId: string) => {
    onClose();
    navigate(`/boards/${boardId}`, { state: { openTaskId: taskId } });
  };

  const [localEmailOnMention, setLocalEmailOnMention] = useState(true);
  const [localEmailOnAssignment, setLocalEmailOnAssignment] = useState(true);
  const [localWebhookOnMention, setLocalWebhookOnMention] = useState(false);
  const [localWebhookOnAssignment, setLocalWebhookOnAssignment] = useState(false);
  const [localWebhookUrl, setLocalWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalEmailOnMention(preferences.emailOnMention);
      setLocalEmailOnAssignment(preferences.emailOnAssignment);
      setLocalWebhookOnMention(preferences.webhookOnMention);
      setLocalWebhookOnAssignment(preferences.webhookOnAssignment);
      setLocalWebhookUrl(preferences.webhookUrl || '');
    }
  }, [preferences]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await updatePreferences({
        emailOnMention: localEmailOnMention,
        emailOnAssignment: localEmailOnAssignment,
        webhookOnMention: localWebhookOnMention,
        webhookOnAssignment: localWebhookOnAssignment,
        webhookUrl: localWebhookUrl || null,
      });
      toastSuccess('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toastError('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasWebhookEnabled = localWebhookOnMention || localWebhookOnAssignment;

  if (!isOpen) return null;

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <div className="notifications-dropdown__tabs">
        <button
          className={`notifications-dropdown__tab ${activeTab === 'notifications' ? 'notifications-dropdown__tab--active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`notifications-dropdown__tab ${activeTab === 'settings' ? 'notifications-dropdown__tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="notifications-dropdown__content">
        {activeTab === 'notifications' && (
          <div className="notifications-dropdown__notifications-tab">
            {notificationsLoading ? (
              <div className="notifications-dropdown__loading">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notifications-dropdown__empty-state">No notifications yet</div>
            ) : (
              notifications.map((notification) => {
                const boardId = notification.task?.taskGroup?.board?.id;
                const taskId = notification.task?.id;
                const taskTitle = notification.task?.title || 'Unknown Task';
                const boardName = notification.task?.taskGroup?.board?.name || 'Unknown Board';
                const notificationDate = new Date(notification.sent_at).toLocaleString();

                return (
                  <div key={notification.id} className="notifications-dropdown__notification">
                    <div className="notifications-dropdown__notification-header">
                      <span className="notifications-dropdown__notification-type">
                        {notification.type === 'mention' ? 'Mention' : 'Assignment'}
                      </span>
                      <span className="notifications-dropdown__notification-date">{notificationDate}</span>
                    </div>
                    <div className="notifications-dropdown__notification-body">
                      {notification.content}{' '}
                      {boardId && taskId ? (
                        <span
                          className="notifications-dropdown__notification-link"
                          onClick={() => handleNotificationClick(boardId, taskId)}
                        >
                          {taskTitle}
                        </span>
                      ) : (
                        <span>{taskTitle}</span>
                      )}
                      <div className="notifications-dropdown__notification-board">{boardName}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="notifications-dropdown__settings-tab">
            {loading ? (
              <div className="notifications-dropdown__loading">Loading settings...</div>
            ) : (
              <>
                <div className="notifications-dropdown__section">
                  <h4 className="notifications-dropdown__section-title">Email Notifications</h4>
                  <label className="notifications-dropdown__checkbox-label">
                    <input
                      type="checkbox"
                      checked={localEmailOnMention}
                      onChange={(e) => setLocalEmailOnMention(e.target.checked)}
                      className="notifications-dropdown__checkbox"
                    />
                    <span>Notify me when I'm mentioned</span>
                  </label>
                  <label className="notifications-dropdown__checkbox-label">
                    <input
                      type="checkbox"
                      checked={localEmailOnAssignment}
                      onChange={(e) => setLocalEmailOnAssignment(e.target.checked)}
                      className="notifications-dropdown__checkbox"
                    />
                    <span>Notify me when I'm assigned to a task</span>
                  </label>
                </div>

                <div className="notifications-dropdown__divider"></div>

                <div className="notifications-dropdown__section">
                  <h4 className="notifications-dropdown__section-title">Webhook Notifications</h4>
                  <label className="notifications-dropdown__checkbox-label">
                    <input
                      type="checkbox"
                      checked={localWebhookOnMention}
                      onChange={(e) => setLocalWebhookOnMention(e.target.checked)}
                      className="notifications-dropdown__checkbox"
                    />
                    <span>Send webhook when I'm mentioned</span>
                  </label>
                  <label className="notifications-dropdown__checkbox-label">
                    <input
                      type="checkbox"
                      checked={localWebhookOnAssignment}
                      onChange={(e) => setLocalWebhookOnAssignment(e.target.checked)}
                      className="notifications-dropdown__checkbox"
                    />
                    <span>Send webhook when I'm assigned to a task</span>
                  </label>

                  {hasWebhookEnabled && (
                    <div className="notifications-dropdown__webhook-url">
                      <label htmlFor="webhook-url" className="notifications-dropdown__input-label">
                        Webhook URL
                      </label>
                      <input
                        id="webhook-url"
                        type="url"
                        value={localWebhookUrl}
                        onChange={(e) => setLocalWebhookUrl(e.target.value)}
                        placeholder="https://your-webhook-endpoint.com/notifications"
                        className="notifications-dropdown__input"
                      />
                    </div>
                  )}
                </div>

                <div className="notifications-dropdown__actions">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="notifications-dropdown__save-btn"
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
