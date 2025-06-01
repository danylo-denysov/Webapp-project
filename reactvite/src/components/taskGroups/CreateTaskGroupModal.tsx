import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../boards/BoardModals.css';
import '../boards/CreateBoardButton.css';
import { toastError } from '../../utils/toast';

export default function CreateTaskGroupModal({
  isOpen, onClose, onCreate,
}: {
  isOpen : boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name,setName] = useState('');
  if (!isOpen) return null;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toastError('Name required'); 
      return;
    }
    onCreate(trimmed); setName(''); onClose();
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}/>
      <div className="modal-window" onMouseDown={e=>e.stopPropagation()}>
        <h2 className="modal-title">Create task group</h2>
        <input className="modal-input"
               value={name}
               onChange={e=>setName(e.target.value)}/>
        <div className="modal-actions">
          <button className="create-board-btn" onClick={submit}>Create</button>
        </div>
      </div>
    </>, document.body);
}
