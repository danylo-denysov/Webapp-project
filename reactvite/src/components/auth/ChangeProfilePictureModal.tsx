import { useState, useRef } from 'react';
import Modal from '../common/Modal/Modal';
import { toastError, toastSuccess } from '../../utils/toast';
import './ChangeProfilePictureModal.css';

interface ChangeProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profilePicture: string) => Promise<void> | void;
  currentProfilePicture?: string | null;
}

export default function ChangeProfilePictureModal({
  isOpen,
  onClose,
  onConfirm,
  currentProfilePicture,
}: ChangeProfilePictureModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentProfilePicture || null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max 1024x1024 for profile pictures)
          const MAX_SIZE = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with quality compression (0.85 = 85% quality)
          const base64String = canvas.toDataURL('image/jpeg', 0.85);
          resolve(base64String);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for original file)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size must be less than 5MB');
      return;
    }

    try {
      // Resize and compress the image
      const base64String = await resizeImage(file);

      setPreview(base64String);
      setSelectedFile(base64String);
    } catch (err) {
      toastError('Failed to process image. Please try another file.');
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = async () => {
    if (!selectedFile) {
      toastError('Please select an image');
      return;
    }

    setIsSaving(true);
    try {
      await onConfirm(selectedFile);
      toastSuccess('Profile picture updated');
      onClose();
      setSelectedFile(null);
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to update profile picture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setPreview(currentProfilePicture || null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} preventClose={isSaving}>
      <h2 className="modal-title">Change Profile Picture</h2>
      <div className="profile-picture-modal">
        <div className="profile-picture-modal__preview">
          {preview ? (
            <img src={preview} alt="Profile preview" />
          ) : (
            <div className="profile-picture-modal__placeholder">No image selected</div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="profile-picture-modal__select-btn"
          onClick={handleSelectFile}
          disabled={isSaving}
        >
          Select Image
        </button>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn"
            onClick={handleConfirm}
            disabled={isSaving || !selectedFile}
          >
            {isSaving ? 'Saving...' : 'Confirm'}
          </button>
          <button
            type="button"
            className="modal-btn"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
