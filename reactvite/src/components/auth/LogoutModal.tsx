import { useState } from 'react';
import { ConfirmModal } from '../common/Modal';
import { toastError, toastSuccess } from '../../utils/toast';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
      toastSuccess('Logged out successfully');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Log out?"
      message="Are you sure you want to log out?"
      confirmText="Yes"
      cancelText="No"
      isLoading={isLoggingOut}
      loadingText="Logging out..."
    />
  );
}
