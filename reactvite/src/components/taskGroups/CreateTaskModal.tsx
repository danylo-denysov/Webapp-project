import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const submit = () => {
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) return window.alert('Both fields are required');
    onCreate(t, d);
    setTitle(''); setDescription('');
    onClose();
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()}>
        <h2 className="modal-title">Create task</h2>

        <label className="modal-label">Name</label>
        <input
          className="modal-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <label className="modal-label" style={{ marginTop: '0.75rem' }}>
          Description
        </label>
        <textarea
          className="modal-input"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div className="modal-actions">
          <button className="create-board-btn" onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
