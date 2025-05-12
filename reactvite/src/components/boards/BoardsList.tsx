import React from 'react'
import { Board } from './BoardCard'
import BoardCard from './BoardCard'
import './BoardsList.css'

interface BoardsListProps {
  boards: Board[]
}

export default function BoardsList({ boards }: BoardsListProps) {
  return (
    <div className="boards-list">
      {boards.map(b => (
        <BoardCard key={b.id} board={b} />
      ))}
    </div>
  )
}
