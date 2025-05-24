import React from 'react';
import { Link } from 'react-router-dom'
import BoardCard, { Board } from './BoardCard';
import './BoardsList.css';

interface BoardsListProps {
  boards: Board[];
  refresh: () => Promise<void>;
}

export default function BoardsList({ boards, refresh }: BoardsListProps) {
  return (
    <div className="boards-list">
      {boards.map(b => (
        <Link
          key={b.id}
          to={`/boards/${b.id}`}
          className="board-card-link"
        >
          <BoardCard board={b} refresh={refresh} />
        </Link>
      ))}
    </div>
  );
}