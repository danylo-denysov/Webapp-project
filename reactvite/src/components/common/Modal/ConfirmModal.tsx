import { ReactNode } from 'react';
import Modal from './Modal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  loadingText = 'Processing...',
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} preventClose={isLoading}>
      <h2 className="modal-title">{title}</h2>
      {message && <p style={{ margin: 0, textAlign: 'center', color: 'var(--color-text)' }}>{message}</p>}
      <div className="modal-actions">
        <button className="modal-btn" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? loadingText : confirmText}
        </button>
        <button className="modal-btn" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </button>
      </div>
    </Modal>
  );
}
