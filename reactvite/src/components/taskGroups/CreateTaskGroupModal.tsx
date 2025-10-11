import { FormModal } from '../common/Modal';

interface CreateTaskGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void | Promise<void>;
}

export default function CreateTaskGroupModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskGroupModalProps) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onCreate}
      title="Create task group"
      placeholder="Group name"
      submitText="Create"
      loadingText="Creating..."
    />
  );
}
