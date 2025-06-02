import React, { useState, useEffect } from 'react';
import { Slide, toast } from 'react-toastify';
import './BoardModals.css';
import ReactDOM from 'react-dom';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

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
      toastError("Board name cannot be empty")
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await safe_fetch(`/api/boards/${boardId}/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to rename board');
      toastSuccess('Board renamed');
      await refresh();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to rename board');
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
