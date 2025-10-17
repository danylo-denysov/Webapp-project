import { useEffect, useRef, useState } from 'react';
import './UserMenu.css';

interface UserMenuProps {
  userId: string;
  username: string;
  onRemove: (userId: string) => void;
}

export default function UserMenu({ userId, onRemove }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', onOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', onOutside, true);
    };
  }, [open]);

  const handleRemove = () => {
    setOpen(false);
    onRemove(userId);
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu__button"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        ⋮
      </button>

      {open && (
        <ul className="user-menu__list">
          <li onClick={handleRemove}>Remove user</li>
        </ul>
      )}
    </div>
  );
}
