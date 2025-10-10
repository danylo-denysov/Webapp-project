// src/components/taskGroups/DeleteTaskGroupModal.tsx
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';
import { toastError } from '../../utils/toast';

interface DeleteTaskGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}

export default function DeleteTaskGroupModal({
  isOpen,
  onClose,
  onConfirm,
  name,
}: DeleteTaskGroupModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to delete task group');
    } finally {
      setIsDeleting(false);
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={isDeleting ? undefined : onClose} />
      <div
        className="modal-window"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Delete &ldquo;{name}&rdquo;?</h2>
        <div className="modal-actions">
          <button className="create-board-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Yes'}
          </button>
          <button className="create-board-btn" onClick={onClose} disabled={isDeleting}>
            No
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
