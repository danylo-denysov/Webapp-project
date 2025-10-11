import { useState, FormEvent } from 'react';
import { Modal } from '../common/Modal';
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} preventClose={isSaving}>
      <h2 className="modal-title">Change Password</h2>
      <form onSubmit={handleSubmit}>
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
          style={{ marginTop: '1rem' }}
        />
        <input
          type="password"
          className="modal-input"
          placeholder="Repeat new password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          disabled={isSaving}
          style={{ marginTop: '1rem' }}
        />
        <div className="modal-actions">
          <button type="submit" className="modal-btn" disabled={isSaving}>
            {isSaving ? 'Changing...' : 'Confirm'}
          </button>
          <button type="button" className="modal-btn" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
