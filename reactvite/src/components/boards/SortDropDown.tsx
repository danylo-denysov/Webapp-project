import { useState, useRef, useEffect } from 'react';
import caretDownIcon from '../../assets/caret-down.svg';
import './SortDropDown.css';

interface SortDropDownProps {
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
  ascending: boolean;
  onToggleOrder: () => void;
}

export default function SortDropDown({ options, selected, onSelect, ascending, onToggleOrder }: SortDropDownProps) {
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
    <div className="sort-dropdown-container">
      <div className="sort-dropdown" ref={ref}>
        <button
          className="sort-button"
          onClick={() => setOpen(o => !o)}
        >
         By {selected} <span className={`arrow ${open ? 'arrow--open' : ''}`}>▼</span>
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

      <button
        className="sort-order-button"
        onClick={onToggleOrder}
        title={ascending ? 'Ascending' : 'Descending'}
      >
        <img
          src={caretDownIcon}
          alt={ascending ? 'Ascending' : 'Descending'}
          className={ascending ? 'sort-icon-up' : 'sort-icon-down'}
        />
      </button>
    </div>
  );
}
