import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import { toastError, toastSuccess } from '../../utils/toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
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
    try {
      await onConfirm();
      toastSuccess('Account deleted');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to delete account');
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
        <h2 className="modal-title">Delete account?</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text)' }}>
          Are you sure you want to delete your account?
        </p>
        <div className="modal-actions">
          <button className="modal-action-btn" onClick={handleConfirm}>
            Yes
          </button>
          <button className="modal-action-btn" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
