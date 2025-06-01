// src/components/taskGroups/RenameTaskGroupModal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';
import { toastError } from '../../utils/toast';

interface RenameTaskGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
}

export default function RenameTaskGroupModal({
  isOpen,
  onClose,
  currentName,
  onRename,
}: RenameTaskGroupModalProps) {
  const [name, setName] = useState(currentName);

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

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
    onRename(trimmed);
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
        <h2 className="modal-title">Rename task group</h2>
        <input
          className="modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button className="create-board-btn" onClick={submit}>
            Save
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
