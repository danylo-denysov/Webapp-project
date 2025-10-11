import { useState } from 'react';
import { ConfirmModal } from '../common/Modal';
import { toastError, toastSuccess } from '../../utils/toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      toastSuccess('Account deleted');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete account?"
      message="Are you sure you want to delete your account? This action cannot be undone."
      confirmText="Yes"
      cancelText="No"
      isLoading={isDeleting}
      loadingText="Deleting..."
    />
  );
}
