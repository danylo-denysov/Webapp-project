import { useState, FormEvent, useEffect } from 'react';
import Modal from './Modal';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  initialValue?: string;
  inputType?: string;
  showCancel?: boolean;
}

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  loadingText = 'Processing...',
  initialValue = '',
  inputType = 'text',
  showCancel = true,
}: FormModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = value.trim();
    if (!trimmed) return;

    await onSubmit(trimmed);
    setValue('');
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} preventClose={isLoading}>
      <h2 className="modal-title">{title}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type={inputType}
          className="modal-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          disabled={isLoading}
        />
        <div className="modal-actions">
          <button type="submit" className="modal-btn" disabled={isLoading || !value.trim()}>
            {isLoading ? loadingText : submitText}
          </button>
          {showCancel && (
            <button type="button" className="modal-btn" onClick={handleCancelClick} disabled={isLoading}>
              {cancelText}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
