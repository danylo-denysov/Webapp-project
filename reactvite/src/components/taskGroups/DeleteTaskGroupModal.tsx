import { useState } from 'react';
import { ConfirmModal } from '../common/Modal';
import { toastError } from '../../utils/toast';

interface DeleteTaskGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  name: string;
}

export default function DeleteTaskGroupModal({
  isOpen,
  onClose,
  onConfirm,
  name,
}: DeleteTaskGroupModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to delete task group');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title={`Delete "${name}"?`}
      message="This action cannot be undone."
      confirmText="Yes"
      cancelText="No"
      isLoading={isDeleting}
      loadingText="Deleting..."
    />
  );
}
