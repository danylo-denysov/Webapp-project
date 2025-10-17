import React, { useState, useRef, useEffect } from 'react';
import './BoardMenu.css';
import { EditBoardModal } from './EditBoardModal';
import { DeleteBoardModal } from './DeleteBoardModal';

interface BoardMenuProps {
  boardId: string;
  initialName: string;
  refresh: () => Promise<void>;
}

export default function BoardMenu({ boardId, initialName, refresh }: BoardMenuProps) {
  const [open, setOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const stopLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="board-menu" ref={ref}>
      <button
        className="menu-button"
        onClick={e => {
          stopLink(e);
          setOpen(o => !o);
        }}
      >
        ⋮
      </button>

      {open && (
        <ul className="menu-list" onClick={stopLink}>
          <li onClick={() => { setOpen(false); setIsEditOpen(true); }}>
            Edit name
          </li>
          <li onClick={() => { setOpen(false); setIsDeleteOpen(true); }}>
            Delete
          </li>
        </ul>
      )}

      <EditBoardModal
        isOpen={isEditOpen}
        initialName={initialName}
        boardId={boardId}
        refresh={refresh}
        onClose={() => setIsEditOpen(false)}
      />

      <DeleteBoardModal
        isOpen={isDeleteOpen}
        boardId={boardId}
        refresh={refresh}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
