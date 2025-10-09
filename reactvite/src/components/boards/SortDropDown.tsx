import { useState, useRef, useEffect } from 'react';
import './SortDropdown.css';

interface SortDropdownProps {
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
}

export default function SortDropdown({ options, selected, onSelect }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        className="sort-button"
        onClick={() => setOpen(o => !o)}
      >
        Sort by {selected} <span className="arrow">▼</span>
      </button>

      {open && (
        <ul className="sort-menu">
          {options.map(opt => (
            <li
              key={opt}
              className={opt === selected ? 'active' : ''}
              onClick={() => { onSelect(opt); setOpen(false); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
