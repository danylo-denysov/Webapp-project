import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/common/Avatar';
import SearchBar from '../../components/boards/SearchBar';
import SortDropdown from '../../components/boards/SortDropdown';
import BoardsList, { Board } from '../../components/boards/BoardsList';
import './BoardsPage.css';

export default function BoardsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Owner' | 'Date'>('Name');
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetch('/api/boards/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login', { replace: true });
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Failed to load boards');
        return res.json() as Promise<Board[]>;
      })
      .then(setBoards)
      .catch(console.error);
  }, [navigate]);

  // filter by name ??
  let filtered = boards.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TODO: sort by owner and date

  return (
    <div className="boards-page">
      <div className="avatar-wrapper">
        <Avatar />
      </div>
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

        <BoardsList boards={filtered} />
      </div>
    </div>
  );
}
