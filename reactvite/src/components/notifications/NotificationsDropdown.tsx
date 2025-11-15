import { useState, useRef, useEffect } from 'react';
import './NotificationsDropdown.css';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationsDropdown({ isOpen, onClose, buttonRef }: NotificationsDropdownProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="notifications-dropdown__empty-state">
              No notifications yet
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="notifications-dropdown__settings-tab">
            <div className="notifications-dropdown__empty-state">
              Notification settings will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
