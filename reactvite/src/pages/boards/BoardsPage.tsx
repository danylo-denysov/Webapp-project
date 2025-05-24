import React, { useState } from 'react';
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

export default function BoardsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Owner' | 'Date'>('Name');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load & manage boards
  const { boards, loading, error: loadError, refresh } = useBoards();
  // Create-board handler; on success, refresh list
  const { createBoard } = useCreateBoard({ onSuccess: refresh });

  // Redirect if unauthorized
  React.useEffect(() => {
    if (loadError === 'Unauthorized') {
      navigate('/login', { replace: true });
    }
  }, [loadError, navigate]);

  if (loading) {
    return <div>Loading boards…</div>;
  }

  // Filter by name
  const filtered = boards.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="boards-page">
      <ToastContainer />
      <div className="header-actions">
        <CreateBoardButton onClick={() => setIsModalOpen(true)} />
        <Avatar />
      </div>

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async name => {
          await createBoard(name);
          setIsModalOpen(false);
        }}
      />

      <div className="boards-divider" />

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
          boards={filtered}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
