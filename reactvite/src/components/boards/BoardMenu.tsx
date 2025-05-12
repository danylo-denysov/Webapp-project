import React, { useState, useRef, useEffect } from 'react'
import './BoardMenu.css'

interface BoardMenuProps {
  onEditName?: () => void
  onEditColor?: () => void
}

export default function BoardMenu({ onEditName, onEditColor }: BoardMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="board-menu" ref={ref}>
      <button className="menu-button" onClick={() => setOpen(o => !o)}>
        ⋮
      </button>
      {open && (
        <ul className="menu-list">
          <li onClick={() => { onEditName?.(); setOpen(false) }}>
            Edit name
          </li>
          <li onClick={() => { onEditColor?.(); setOpen(false) }}>
            Edit color
          </li>
        </ul>
      )}
    </div>
  )
}
