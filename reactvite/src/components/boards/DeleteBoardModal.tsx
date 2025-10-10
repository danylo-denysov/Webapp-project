import { useEffect, useState } from 'react';
import './BoardModals.css';
import ReactDOM from 'react-dom';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

interface DeleteBoardModalProps {
  isOpen: boolean;
  boardId: string;
  refresh: () => Promise<void>;
  onClose: () => void;
}

export function DeleteBoardModal({
  isOpen,
  boardId,
  refresh,
  onClose,
}: DeleteBoardModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isDeleting && onClose();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await safe_fetch(`/api/boards/${boardId}/user`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete board');
      toastSuccess('Board deleted');
      await refresh();
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to delete board');
    } finally {
      setIsDeleting(false);
    }
  };

  return ReactDOM.createPortal (
    <>
      <div className="modal-overlay" onClick={isDeleting ? undefined : onClose} />
      <div className="modal-window" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Delete board?</h2>
        <div className="modal-actions">
          <button className="create-board-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Yes'}
          </button>
          <button className="create-board-btn" onClick={onClose} disabled={isDeleting}>No</button>
        </div>
      </div>
    </>,
    document.body
  );
}
