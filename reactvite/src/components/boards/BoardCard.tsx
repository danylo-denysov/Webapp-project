import { useMemo } from 'react';
import './BoardCard.css';
import BoardMenu from './BoardMenu';
import { Board } from '../../types/board';

interface BoardCardProps {
  board: Board
  refresh: () => Promise<void>
}

// helper to get a random hex color
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF)
    .toString(16)
    .padStart(6, '0')
}

// for now creates a random color for each card square
// note: add avatar to the board in the future
export default function BoardCard({ board, refresh }: BoardCardProps) {
  // useMemo so it only picks once per card instance
  const randomColor = useMemo(() => getRandomColor(), [])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  }

  return (
    <div className="board-card">
      <div className="board-card-left">
        <div
          className="board-color"
          style={{ backgroundColor: randomColor }}
        />
        <span className="board-name">{board.name}</span>
      </div>

      <span className="board-owner">{board.owner.username}</span>
      <span className="board-date">{formatDate(board.created_at)}</span>

      <BoardMenu
        boardId={board.id}
        initialName={board.name}
        refresh={refresh}
      />
    </div>
  )
}
