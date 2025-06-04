import React, { useState, useEffect } from 'react';
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

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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
    try {
      await onConfirm(currentPassword, newPassword);
      toastSuccess('Password changed');
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to change password');
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
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
        />
        <input
          type="password"
          className="modal-input"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          className="modal-input"
          placeholder="Repeat new password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
        <div className="modal-actions">
          <button className="modal-action-btn" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="modal-action-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
