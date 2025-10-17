import { Link } from 'react-router-dom'
import BoardCard from './BoardCard';
import { Board } from '../../types/board';
import './BoardsList.css';

interface BoardsListProps {
  boards: Board[];
  refresh: () => Promise<void>;
  currentUserId: string | null;
}

export default function BoardsList({ boards, refresh, currentUserId }: BoardsListProps) {
  return (
    <div className="boards-list">
      {boards.map(b => (
        <Link
          key={b.id}
          to={`/boards/${b.id}`}
          className="board-card-link"
        >
          <BoardCard board={b} refresh={refresh} currentUserId={currentUserId} />
        </Link>
      ))}
    </div>
  );
}