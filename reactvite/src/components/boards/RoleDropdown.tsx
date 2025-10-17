import { useState, useRef, useEffect } from 'react';
import { BoardUserRole } from '../../types/boardUser';
import './RoleDropdown.css';

interface RoleDropdownProps {
  role: BoardUserRole;
  onChange: (role: BoardUserRole) => void;
  disabled?: boolean;
}

export default function RoleDropdown({ role, onChange, disabled = false }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const roles = [BoardUserRole.EDITOR, BoardUserRole.VIEWER];

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [open]);

  return (
    <div className="role-dropdown" ref={ref}>
      <button
        className="role-dropdown__button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        type="button"
      >
        {role} <span className="role-dropdown__arrow">▼</span>
      </button>

      {open && (
        <ul className="role-dropdown__menu">
          {roles.map((r) => (
            <li
              key={r}
              className={r === role ? 'role-dropdown__item--active' : ''}
              onClick={() => {
                onChange(r);
                setOpen(false);
              }}
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
