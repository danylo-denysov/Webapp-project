import { FormModal } from '../common/Modal';

interface RenameTaskGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void | Promise<void>;
}

export default function RenameTaskGroupModal({
  isOpen,
  onClose,
  currentName,
  onRename,
}: RenameTaskGroupModalProps) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onRename}
      title="Rename task group"
      placeholder="Group name"
      submitText="Rename"
      loadingText="Saving..."
      initialValue={currentName}
    />
  );
}
