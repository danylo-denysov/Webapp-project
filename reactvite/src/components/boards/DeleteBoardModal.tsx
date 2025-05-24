import React, { useEffect } from 'react';
import { toast, Slide } from 'react-toastify';
import './BoardModals.css';
import ReactDOM from 'react-dom';

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
      const res = await fetch(`/api/boards/${boardId}/user`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete board');
      toast.success(
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          Board deleted
        </span>, {
          position: 'top-center', autoClose: 2000,
          hideProgressBar: false, icon: false,
          closeOnClick: true, pauseOnHover: true,
          draggable: true, transition: Slide,
          style: { backgroundColor: 'var(--color-cards)', color: 'var(--color-text)' },
        }
      );
      await refresh();
      onClose();
    } catch (err: any) {
      toast.error(
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          {err.message || 'Failed to delete board'}
        </span>, {
          position: 'top-center', autoClose: 3000,
          hideProgressBar: false, icon: false,
          closeOnClick: true, pauseOnHover: true,
          draggable: true, transition: Slide,
          style: { backgroundColor: 'var(--color-cards)', color: 'var(--color-text)' },
        }
      );
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
