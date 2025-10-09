import { useState, useEffect } from 'react';
import './BoardModals.css';
import './CreateBoardButton.css';
import ReactDOM from 'react-dom';
import { toastError } from '../../utils/toast';

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
      toastError('Board name cannot be empty');
      return;
    }
    onCreate(trimmed);
    setName('');
    onClose();
  };

  return ReactDOM.createPortal (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
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
    </>,
    document.body
  );
}
