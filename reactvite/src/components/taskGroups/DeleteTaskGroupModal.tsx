// src/components/taskGroups/DeleteTaskGroupModal.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';
import { toastError, toastSuccess } from '../../utils/toast';

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
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete task group');
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
        <h2 className="modal-title">Delete &ldquo;{name}&rdquo;?</h2>
        <div className="modal-actions">
          <button className="create-board-btn" onClick={handleDelete}>
            Yes
          </button>
          <button className="create-board-btn" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
