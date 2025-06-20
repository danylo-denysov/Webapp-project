import React, { useState, useEffect } from 'react';
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
    if (!nickname.trim()) {
      toastError('Nickname cannot be empty');
      return;
    }
    try {
      await onConfirm(nickname.trim());
      toastSuccess('Nickname changed');
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to change nickname');
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
        <h2 className="modal-title">Change Nickname</h2>
        <input
          type="text"
          className="modal-input"
          placeholder="New nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoFocus
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
