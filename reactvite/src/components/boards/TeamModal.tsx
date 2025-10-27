import { useState } from 'react';
import Modal from '../common/Modal/Modal';
import SearchBar from './SearchBar';
import Avatar from '../common/Avatar';
import RoleDropdown from './RoleDropdown';
import UserMenu from './UserMenu';
import { useBoardUsers } from '../../hooks/boards/useBoardUsers';
import { useSearchUsers } from '../../hooks/boards/useSearchUsers';
import { BoardUserRole } from '../../types/boardUser';
import { safe_fetch } from '../../utils/api';
import { toastSuccess, toastError } from '../../utils/toast';
import plusIcon from '../../assets/plus.svg';
import './TeamModal.css';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  isOwner: boolean;
}

export default function TeamModal({ isOpen, onClose, boardId, isOwner }: TeamModalProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'invite'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const { users: boardUsers, loading: boardUsersLoading, refresh } = useBoardUsers(boardId);
  const { users: searchResults, loading: searchLoading } = useSearchUsers(searchQuery);


  const handleRoleChange = async (userId: string, newRole: BoardUserRole) => {
    try {
      const res = await safe_fetch(`/api/boards/${boardId}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update role' }));
        throw new Error(errorData.message || 'Failed to update role');
      }

      toastSuccess('Role updated successfully');
      refresh();
    } catch (error) {
      toastError((error as Error).message);
    }
  };

  const handleAddUser = async (userId: string, role: BoardUserRole) => {
    try {
      const res = await safe_fetch(`/api/boards/${boardId}/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to add user' }));
        throw new Error(errorData.message || 'Failed to add user');
      }

      toastSuccess('User added successfully');
      setSearchQuery('');
      setActiveTab('team');
      refresh();
    } catch (error) {
      toastError((error as Error).message);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const res = await safe_fetch(`/api/boards/${boardId}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to remove user' }));
        throw new Error(errorData.message || 'Failed to remove user');
      }

      toastSuccess('User removed successfully');
      refresh();
    } catch (error) {
      toastError((error as Error).message);
    }
  };

  const boardUserIds = new Set(boardUsers.map((bu) => bu.user.id));
  const filteredSearchResults = searchResults.filter((user) => !boardUserIds.has(user.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="team-modal">
        <div className="team-modal__tabs">
          <button
            className={`team-modal__tab ${activeTab === 'team' ? 'team-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team
          </button>
          {isOwner && (
            <button
              className={`team-modal__tab ${activeTab === 'invite' ? 'team-modal__tab--active' : ''}`}
              onClick={() => setActiveTab('invite')}
            >
              Invite
            </button>
          )}
        </div>

        <div className="team-modal__content">
          {activeTab === 'team' && (
            <div className="team-modal__team-tab">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />

              {boardUsersLoading ? (
                <div className="team-modal__loading">Loading...</div>
              ) : (
                <div className="team-modal__users-list">
                  {boardUsers
                    .filter((bu) =>
                      searchQuery
                        ? bu.user.username.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((bu) => (
                      <div key={bu.id} className="team-modal__user-item">
                        <Avatar size={40} />
                        <span className="team-modal__username">{bu.user.username}</span>
                        <RoleDropdown
                          role={bu.role}
                          onChange={(newRole) => handleRoleChange(bu.user.id, newRole)}
                          disabled={!isOwner || bu.role === BoardUserRole.OWNER}
                        />
                        {isOwner && bu.role !== BoardUserRole.OWNER && (
                          <UserMenu
                            userId={bu.user.id}
                            username={bu.user.username}
                            onRemove={handleRemoveUser}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'invite' && isOwner && (
            <div className="team-modal__invite-tab">
              <SearchBar value={searchQuery} onChange={setSearchQuery} autoFocus={true} />

              {searchLoading ? (
                <div className="team-modal__loading">Searching...</div>
              ) : searchQuery && filteredSearchResults.length === 0 ? (
                <div className="team-modal__empty">No users found</div>
              ) : (
                <div className="team-modal__users-list">
                  {filteredSearchResults.map((user) => (
                    <div key={user.id} className="team-modal__user-item">
                      <Avatar size={40} />
                      <span className="team-modal__username">{user.username}</span>
                      <button
                        className="team-modal__add-button"
                        onClick={() => handleAddUser(user.id, BoardUserRole.EDITOR)}
                        title="Add as Editor"
                      >
                        <img src={plusIcon} alt="Add" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
