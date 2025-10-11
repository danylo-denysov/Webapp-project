import { useState, useRef, useEffect } from 'react';
import './SortDropDown.css';

interface SortDropDownProps {
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
}

export default function SortDropDown({ options, selected, onSelect }: SortDropDownProps) {
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
