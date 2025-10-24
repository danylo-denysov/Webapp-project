import { FormModal } from '../common/Modal';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void | Promise<void>;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onCreate}
      title="Create task"
      placeholder="Task name"
      submitText="Create"
      loadingText="Creating..."
    />
  );
}
