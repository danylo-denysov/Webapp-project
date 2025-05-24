import React, { useState, useEffect } from 'react';
import { Slide, toast } from 'react-toastify';
import './BoardModals.css';
import ReactDOM from 'react-dom';

interface EditBoardModalProps {
  isOpen: boolean;
  boardId: string;
  initialName: string;
  refresh: () => Promise<void>;
  onClose: () => void;
}

export function EditBoardModal({
  isOpen,
  boardId,
  initialName,
  refresh,
  onClose,
}: EditBoardModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  useEffect(() => {
    // Close on Escape
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          Board name cannot be empty
        </span>, {
          position: 'top-center', autoClose: 3000,
          hideProgressBar: false, icon: false,
          closeOnClick: true, pauseOnHover: true,
          draggable: true, transition: Slide,
          style: { backgroundColor: 'var(--color-cards)', color: 'var(--color-text)' },
        }
      );
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/boards/${boardId}/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to rename board');
      toast.success(
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          Board renamed
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
          {err.message || 'Failed to rename board'}
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

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Provide new board name</h2>
        <input
          className="modal-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button className="create-board-btn" onClick={handleSave}>Edit name</button>
          <button className="create-board-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>,
    document.body
  );
}
