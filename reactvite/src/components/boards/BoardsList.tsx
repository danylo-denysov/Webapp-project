import React from 'react';
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
        <BoardCard
          key={b.id}
          board={b}
          refresh={refresh}
        />
      ))}
    </div>
  );
}