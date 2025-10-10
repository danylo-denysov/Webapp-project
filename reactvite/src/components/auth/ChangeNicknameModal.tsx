import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import { toastError, toastSuccess } from '../../utils/toast';

interface ChangeNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newNickname: string) => Promise<void> | void;
}

export default function ChangeNicknameModal({
  isOpen,
  onClose,
  onConfirm,
}: ChangeNicknameModalProps) {
  const [nickname, setNickname] = useState('');
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
    if (!nickname.trim()) {
      toastError('Nickname cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await onConfirm(nickname.trim());
      toastSuccess('Nickname changed');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to change nickname');
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
        <h2 className="modal-title">Change Nickname</h2>
        <input
          type="text"
          className="modal-input"
          placeholder="New nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoFocus
          disabled={isSaving}
        />
        <div className="modal-actions">
          <button className="modal-action-btn" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Confirm'}
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
