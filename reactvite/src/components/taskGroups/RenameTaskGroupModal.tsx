import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';

export default function RenameTaskGroupModal({
  isOpen,
  onClose,
  currentName,
  onRename,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
}) {
  const [name, setName] = useState(currentName);
  useEffect(() => { if (isOpen) setName(currentName); }, [isOpen, currentName]);

  if (!isOpen) return null;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return window.alert('Name required');
    onRename(trimmed);
    onClose();
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()}>
        <h2 className="modal-title">Rename task group</h2>
        <input
          className="modal-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button className="create-board-btn" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
