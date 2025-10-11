import { useState, FormEvent } from 'react';
import { Modal } from '../common/Modal';
import { toastError } from '../../utils/toast';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void | Promise<void>;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      toastError('Both fields are required');
      return;
    }
    setIsCreating(true);
    try {
      await onCreate(t, d);
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} preventClose={isCreating}>
      <h2 className="modal-title">Create task</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          Name
        </label>
        <input
          className="modal-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
          disabled={isCreating}
        />

        <label style={{ display: 'block', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          Description
        </label>
        <textarea
          className="modal-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          disabled={isCreating}
          style={{ resize: 'vertical' }}
        />

        <div className="modal-actions">
          <button type="submit" className="modal-btn" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create task'}
          </button>
          <button type="button" className="modal-btn" onClick={onClose} disabled={isCreating}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
