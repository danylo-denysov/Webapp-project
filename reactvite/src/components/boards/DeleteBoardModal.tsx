import { useState } from 'react';
import { ConfirmModal } from '../common/Modal';
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await safe_fetch(`/api/boards/${boardId}/user`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete board');
      toastSuccess('Board deleted');
      await refresh();
      onClose();
    } catch (err) {
      const error = err as Error;
      // Don't show error toast if session expired (safe_fetch already redirects)
      if (error.message !== 'Session expired') {
        toastError(error.message || 'Failed to delete board');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete board?"
      message="This action cannot be undone."
      confirmText="Yes"
      cancelText="No"
      isLoading={isDeleting}
      loadingText="Deleting..."
    />
  );
}
