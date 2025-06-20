import React, { useEffect } from 'react';
import { toast, Slide } from 'react-toastify';
import './BoardModals.css';
import ReactDOM from 'react-dom';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

interface DeleteBoardModalProps {
  isOpen: boolean;
  boardId: string;
  refresh: () => Promise<void>;
  onClose: () => void;
}

export function DeleteBoardModal({
  isOpen,
  boardId,
  refresh,
  onClose,
}: DeleteBoardModalProps) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await safe_fetch(`/api/boards/${boardId}/user`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete board');
      toastSuccess('Board deleted');
      await refresh();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete board');
    }
  };

  return ReactDOM.createPortal (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Delete board?</h2>
        <div className="modal-actions">
          <button className="create-board-btn" onClick={handleDelete}>Yes</button>
          <button className="create-board-btn" onClick={onClose}>No</button>
        </div>
      </div>
    </>,
    document.body
  );
}
