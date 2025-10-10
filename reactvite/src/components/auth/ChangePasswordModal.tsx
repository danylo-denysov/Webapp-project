import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import { toastError, toastSuccess } from '../../utils/toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (current: string, next: string) => Promise<void> | void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onConfirm,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, isSaving]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      toastError('All fields are required');
      return;
    }
    if (newPassword !== repeatPassword) {
      toastError('New passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      await onConfirm(currentPassword, newPassword);
      toastSuccess('Password changed');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={isSaving ? undefined : onClose} />
      <div
        className="modal-window"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Change Password</h2>
        <input
          type="password"
          className="modal-input"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoFocus
          disabled={isSaving}
        />
        <input
          type="password"
          className="modal-input"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isSaving}
        />
        <input
          type="password"
          className="modal-input"
          placeholder="Repeat new password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          disabled={isSaving}
        />
        <div className="modal-actions">
          <button className="modal-action-btn" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Changing...' : 'Confirm'}
          </button>
          <button className="modal-action-btn" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
