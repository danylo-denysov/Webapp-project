// src/components/taskGroups/CreateTaskGroupModal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';
import { toastError } from '../../utils/toast';

interface CreateTaskGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateTaskGroupModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskGroupModalProps) {
  const [name, setName] = useState('');

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

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toastError('Name required');
      return;
    }
    onCreate(trimmed);
    setName('');
    onClose();
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div
        className="modal-window"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Create task group</h2>
        <input
          className="modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Group name"
        />
        <div className="modal-actions">
          <button className="create-board-btn" onClick={submit}>
            Create
          </button>
          <button className="create-board-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
