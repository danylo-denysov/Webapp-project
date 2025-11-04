import { useMemo, useState, useEffect } from 'react';
import './BoardCard.css';
import BoardMenu from './BoardMenu';
import ColorPicker from './ColorPicker';
import { Board } from '../../types/board';

interface BoardCardProps {
  board: Board
  refresh: () => Promise<void>
  currentUserId: string | null
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF)
    .toString(16)
    .padStart(6, '0')
}

function getStoredColor(boardId: string): string | null {
  return localStorage.getItem(`board-color-${boardId}`);
}

function setStoredColor(boardId: string, color: string): void {
  localStorage.setItem(`board-color-${boardId}`, color);
}

export default function BoardCard({ board, refresh, currentUserId }: BoardCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [initialColorSet, setInitialColorSet] = useState(false)
  const [boardColor, setBoardColor] = useState<string>(() => {
    // Check board color first, then localStorage, then generate and save random color
    if (board.color) return board.color

    const stored = getStoredColor(board.id)
    if (stored) return stored

    // Generate random color and save it immediately
    const random = getRandomColor()
    setStoredColor(board.id, random)
    return random
  })
  const isOwner = currentUserId === board.owner.id

  useEffect(() => {
    if (board.color) {
      setBoardColor(board.color)
      // Also update localStorage when board color is set from server
      setStoredColor(board.id, board.color)
    }
  }, [board.color, board.id])

  // Save initial random color to database if it wasn't set
  useEffect(() => {
    const saveInitialColor = async () => {
      if (!board.color && !initialColorSet && isOwner) {
        setInitialColorSet(true)
        try {
          const res = await fetch(`/api/boards/${board.id}/color`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ color: boardColor }),
          })

          if (!res.ok) {
            console.error('Failed to save initial board color')
          }
        } catch (error) {
          console.error('Error saving initial board color:', error)
        }
      }
    }

    saveInitialColor()
  }, [board.id, board.color, boardColor, initialColorSet, isOwner])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  }

  const handleColorClick = (e: React.MouseEvent) => {
    if (!isOwner) return
    e.preventDefault()
    e.stopPropagation()
    setShowColorPicker(!showColorPicker)
  }

  const handleColorChange = async (color: string) => {
    setBoardColor(color)
    setStoredColor(board.id, color)

    // Call API to update board color
    try {
      const res = await fetch(`/api/boards/${board.id}/color`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ color }),
      })

      if (!res.ok) {
        throw new Error('Failed to update board color')
      }
    } catch (error) {
      console.error('Error updating board color:', error)
      // Keep the color in localStorage even if API call fails
    }
  }

  const handleCloseColorPicker = () => {
    setShowColorPicker(false)
  }

  return (
    <div className="board-card">
      <div className="board-card-left">
        <div className="board-color-wrapper">
          <div
            className={`board-color ${isOwner ? 'board-color--clickable' : ''}`}
            style={{ backgroundColor: boardColor }}
            onClick={handleColorClick}
            title={isOwner ? "Change board color" : undefined}
          />
          {showColorPicker && isOwner && (
            <ColorPicker
              currentColor={boardColor}
              onColorChange={handleColorChange}
              onClose={handleCloseColorPicker}
            />
          )}
        </div>
        <span className="board-name">{board.name}</span>
      </div>

      <span className="board-owner">{board.owner.username}</span>
      <span className="board-date">{formatDate(board.created_at)}</span>

      <div className="board-menu-wrapper">
        {isOwner && (
          <BoardMenu
            boardId={board.id}
            initialName={board.name}
            refresh={refresh}
          />
        )}
      </div>
    </div>
  )
}
