import { useEffect, ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  preventClose?: boolean;
}

export default function Modal({ isOpen, onClose, children, preventClose = false }: ModalProps) {
  const mouseDownOnOverlay = useRef(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      mouseDownOnOverlay.current = true;
    }
    e.stopPropagation();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget && mouseDownOnOverlay.current && !preventClose) {
      onClose();
    }
    mouseDownOnOverlay.current = false;
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div className="modal-window">
        {children}
      </div>
    </div>,
    document.body
  );
}
