import React from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';

export default function DeleteTaskGroupModal({
  isOpen,
  onClose,
  onConfirm,
  name,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()}>
        <h2 className="modal-title">Delete “{name}”?</h2>
        <p>This can’t be undone.</p>
        <div className="modal-actions">
          <button className="create-board-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
