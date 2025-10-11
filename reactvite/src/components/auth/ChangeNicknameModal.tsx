import { useState } from 'react';
import { FormModal } from '../common/Modal';
import { toastError, toastSuccess } from '../../utils/toast';

interface ChangeNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newNickname: string) => Promise<void> | void;
}

export default function ChangeNicknameModal({
  isOpen,
  onClose,
  onConfirm,
}: ChangeNicknameModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async (nickname: string) => {
    setIsSaving(true);
    try {
      await onConfirm(nickname);
      toastSuccess('Nickname changed');
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to change nickname');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleConfirm}
      title="Change Nickname"
      placeholder="New nickname"
      submitText="Confirm"
      loadingText="Saving..."
      isLoading={isSaving}
    />
  );
}
