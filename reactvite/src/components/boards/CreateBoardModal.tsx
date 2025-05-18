import React, { useState, useEffect } from 'react';
import { Slide, toast } from 'react-toastify';
import './BoardModals.css';
import './CreateBoardButton.css';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onCreate,
}: CreateBoardModalProps) {
  const [name, setName] = useState('');

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>❌</span>
        Board name cannot be empty
      </span>, 
      {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: false,
        transition: Slide,
        style: {
          backgroundColor: 'var(--color-cards)',
          color: 'var(--color-text)',
        },
      });
      return;
    }
    onCreate(trimmed);
    setName('');
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window">
        <h2 className="modal-title">Create new board</h2>
        <input
          type="text"
          className="modal-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button className="create-board-btn" onClick={handleSubmit}>
            Create board
          </button>
        </div>
      </div>
    </>
  );
}
