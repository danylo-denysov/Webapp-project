import { FormModal } from '../common/Modal';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void | Promise<void>;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onCreate,
}: CreateBoardModalProps) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onCreate}
      title="Create new board"
      placeholder="Board name"
      submitText="Create"
      loadingText="Creating..."
    />
  );
}
