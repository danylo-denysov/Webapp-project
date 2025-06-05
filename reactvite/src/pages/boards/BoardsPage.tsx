import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/common/Avatar';
import CreateBoardButton from '../../components/boards/CreateBoardButton';
import SearchBar from '../../components/boards/SearchBar';
import SortDropdown from '../../components/boards/SortDropdown';
import BoardsList, { Board } from '../../components/boards/BoardsList';
import CreateBoardModal from '../../components/boards/CreateBoardModal';
import { useBoards } from '../../hooks/boards/useBoards';
import { useCreateBoard } from '../../hooks/boards/useCreateBoard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BoardsPage.css';
import Header from '../../components/common/Header';
import { Link } from 'react-router-dom';
import { toastError } from '../../utils/toast';

const cmp = <T, K extends keyof T>(a: T, b: T, key: K) => {
  const va = a[key];
  const vb = b[key];
  if (typeof va === 'string' && typeof vb === 'string') {
    return va.localeCompare(vb, undefined, { sensitivity: 'base' });
  }
  return (va as any) > (vb as any) ? 1 : (va === vb ? 0 : -1);
};

export default function BoardsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Owner' | 'Date'>('Name');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { boards, loading, error: loadError, refresh } = useBoards();
  const { createBoard } = useCreateBoard({ onSuccess: refresh });

  // Redirect if unauthorized
  React.useEffect(() => {
    if (loadError === 'Unauthorized') {
      navigate('/login', { replace: true });
    }
  }, [loadError, navigate]);

  const boardsErrorToastedRef = useRef(false);
  useEffect(() => {
    if (loadError && loadError !== 'Unauthorized' && !boardsErrorToastedRef.current) {
      toastError(loadError);
      boardsErrorToastedRef.current = true;
    }
  }, [loadError]);

  if (loading) {
    return <div>Loading boards…</div>;
  }

  const filteredAndSorted = boards
    .filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          return cmp(a, b, 'name');
        case 'Owner':
          return cmp(a, b, 'owner');
        case 'Date':
          return cmp(a, b, 'created_at');
        default:
          return 0;
      }
    });

  return (
    <div className="boards-page">
      <Header
        right={
          <>
            <CreateBoardButton onClick={() => setIsModalOpen(true)} />
            <Link to="/profile">
              <Avatar />
            </Link>
          </>
        }
      />

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async name => {
          await createBoard(name);
          setIsModalOpen(false);
        }}
      />


      <div className="boards-content">
        <div className="boards-controls">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <SortDropdown
            options={['Name', 'Owner', 'Date']}
            selected={sortBy}
            onSelect={setSortBy}
          />
          <div className="boards-headers">
            <span>Owner</span>
            <span>Created at</span>
          </div>
        </div>

        <BoardsList
          boards={filteredAndSorted}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
