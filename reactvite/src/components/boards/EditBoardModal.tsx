import { useState } from 'react';
import { FormModal } from '../common/Modal';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

interface EditBoardModalProps {
  isOpen: boolean;
  boardId: string;
  initialName: string;
  refresh: () => Promise<void>;
  onClose: () => void;
}

export function EditBoardModal({
  isOpen,
  boardId,
  initialName,
  refresh,
  onClose,
}: EditBoardModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (name: string) => {
    setIsSaving(true);
    try {
      const res = await safe_fetch(`/api/boards/${boardId}/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to rename board');
      toastSuccess('Board renamed');
      await refresh();
      onClose();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to rename board');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSave}
      title="Provide new board name"
      placeholder="Board name"
      submitText="Edit name"
      loadingText="Saving..."
      isLoading={isSaving}
      initialValue={initialName}
    />
  );
}
