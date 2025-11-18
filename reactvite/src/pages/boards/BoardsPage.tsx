import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import BoardsList from '../../components/boards/BoardsList';
import CreateBoardButton from '../../components/boards/CreateBoardButton';
import CreateBoardModal from '../../components/boards/CreateBoardModal';
import SearchBar from '../../components/boards/SearchBar';
import SortDropDown from '../../components/boards/SortDropDown';
import NotificationsDropdown from '../../components/notifications/NotificationsDropdown';
import { useCurrentUser } from '../../hooks/auth/useCurrentUser';
import { useBoards } from '../../hooks/boards/useBoards';
import { useCreateBoard } from '../../hooks/boards/useCreateBoard';
import { toastError } from '../../utils/toast';

import notificationIcon from '../../assets/notification.svg';
import './BoardsPage.css';

const cmp = <T, K extends keyof T>(a: T, b: T, key: K) => {
  const va = a[key];
  const vb = b[key];
  if (typeof va === 'string' && typeof vb === 'string') {
    return va.localeCompare(vb, undefined, { sensitivity: 'base' });
  }
  if (va > vb) return 1;
  if (va < vb) return -1;
  return 0;
};

export default function BoardsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Owner' | 'Date'>('Date');
  const [ascending, setAscending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  const { boards, loading, error: loadError, refresh } = useBoards();
  const { createBoard } = useCreateBoard({ onSuccess: refresh });
  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
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

  const filteredAndSorted = useMemo(() => {
    return boards
      .filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        let result = 0;
        switch (sortBy) {
          case 'Name':
            result = cmp(a, b, 'name');
            break;
          case 'Owner':
            result = cmp(a, b, 'owner');
            break;
          case 'Date':
            result = cmp(a, b, 'created_at');
            break;
          default:
            result = 0;
        }
        return ascending ? result : -result;
      });
  }, [boards, searchTerm, sortBy, ascending]);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleCreateBoard = useCallback(async (name: string) => {
    await createBoard(name);
    setIsModalOpen(false);
  }, [createBoard]);

  const handleSortChange = useCallback((opt: string) => {
    setSortBy(opt as 'Name' | 'Owner' | 'Date');
  }, []);

  const handleToggleOrder = useCallback(() => {
    setAscending(prev => !prev);
  }, []);

  if (loading) {
    return <div>Loading boards…</div>;
  }

  return (
    <div className="boards-page">
      <Header
        right={
          <>
            <CreateBoardButton onClick={handleOpenModal} />
            <div style={{ position: 'relative' }}>
              <button
                ref={notificationsButtonRef}
                className="notifications-icon-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <img src={notificationIcon} alt="Notifications" />
              </button>
              <NotificationsDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                buttonRef={notificationsButtonRef}
              />
            </div>
            <Link to="/profile">
              <Avatar profilePicture={currentUser?.profile_picture} />
            </Link>
          </>
        }
      />

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateBoard}
      />


      <div className="boards-content">
        <div className="boards-top">
          <div className="boards-controls">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <SortDropDown
              options={['Name', 'Owner', 'Date']}
              selected={sortBy}
              onSelect={handleSortChange}
              ascending={ascending}
              onToggleOrder={handleToggleOrder}
            />
          </div>

          <div className="boards-headers">
            <span>Owner</span>
            <span>Created at</span>
          </div>
        </div>

        <div className="boards-scroll-container">
          {filteredAndSorted.length === 0 ? (
            <div className="boards-empty-state">
              <p className="boards-empty-state__text">
                {searchTerm
                  ? 'No boards found matching your search'
                  : 'No boards created yet. Click "Create Board" to get started!'}
              </p>
            </div>
          ) : (
            <BoardsList
              boards={filteredAndSorted}
              refresh={refresh}
              currentUserId={currentUser?.id || null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
