import { useState, useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';
import SearchBar from '../boards/SearchBar';
import closeIcon from '../../assets/close.svg';
import './UserAssignmentDropdown.css';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture?: string | null;
}

interface UserAssignmentDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  assignedUsers: User[];
  availableUsers: User[];
  onAssign: (userId: string) => void;
  onRemove: (userId: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function UserAssignmentDropdown({
  isOpen,
  onClose,
  assignedUsers,
  availableUsers,
  onAssign,
  onRemove,
  buttonRef,
}: UserAssignmentDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available users based on search query and exclude already assigned users
  const assignedUserIds = new Set(assignedUsers.map(u => u.id));
  const filteredAvailableUsers = availableUsers
    .filter(u => !assignedUserIds.has(u.id))
    .filter(u =>
      searchQuery
        ? u.username.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const filteredAssignedUsers = assignedUsers.filter(u =>
    searchQuery
      ? u.username.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Handle click outside and escape key to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      // Use capture phase for click to ensure we catch it before other handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      // Use capture phase for escape key to prevent modal from closing
      document.addEventListener('keydown', handleEscapeKey, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscapeKey, true);
    };
  }, [isOpen, onClose, buttonRef]);

  // Reset search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Position dropdown below the button
  const buttonRect = buttonRef.current?.getBoundingClientRect();
  const top = buttonRect ? buttonRect.bottom + 4 : 0;
  const left = buttonRect ? buttonRect.left : 0;

  return (
    <div
      ref={dropdownRef}
      className="user-assignment-dropdown"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <div className="user-assignment-dropdown__search">
        <SearchBar value={searchQuery} onChange={setSearchQuery} autoFocus={true} />
      </div>

      {/* Assigned users section */}
      {filteredAssignedUsers.length > 0 && (
        <div className="user-assignment-dropdown__section">
          <h4 className="user-assignment-dropdown__section-title">Assigned</h4>
          <div className="user-assignment-dropdown__users-list">
            {filteredAssignedUsers.map(user => (
              <div key={user.id} className="user-assignment-dropdown__user-item">
                <Avatar size={32} profilePicture={user.profile_picture} />
                <span className="user-assignment-dropdown__username">{user.username}</span>
                <button
                  className="user-assignment-dropdown__remove-btn"
                  onClick={() => onRemove(user.id)}
                  title="Remove from task"
                >
                  <img src={closeIcon} alt="Remove" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available users section */}
      <div className="user-assignment-dropdown__section">
        {filteredAssignedUsers.length > 0 && (
          <h4 className="user-assignment-dropdown__section-title">Board Members</h4>
        )}
        <div className="user-assignment-dropdown__users-list">
          {filteredAvailableUsers.length === 0 ? (
            <div className="user-assignment-dropdown__empty">
              {searchQuery ? 'No users found' : 'All board members are assigned'}
            </div>
          ) : (
            filteredAvailableUsers.map(user => (
              <div
                key={user.id}
                className="user-assignment-dropdown__user-item user-assignment-dropdown__user-item--clickable"
                onClick={() => onAssign(user.id)}
              >
                <Avatar size={32} profilePicture={user.profile_picture} />
                <span className="user-assignment-dropdown__username">{user.username}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
