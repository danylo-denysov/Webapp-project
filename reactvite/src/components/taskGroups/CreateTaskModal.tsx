// src/components/taskGroups/CreateTaskModal.tsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';
import { toastError } from '../../utils/toast';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      toastError('Both fields are required');
      return;
    }
    onCreate(t, d);
    setTitle('');
    setDescription('');
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
        <h2 className="modal-title">Create task</h2>

        <label className="modal-label">Name</label>
        <input
          className="modal-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />

        <label className="modal-label" style={{ marginTop: '0.75rem' }}>
          Description
        </label>
        <textarea
          className="modal-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
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
