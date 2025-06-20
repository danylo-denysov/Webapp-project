import React from 'react';
import { useNavigate } from 'react-router-dom';
import { safe_fetch } from '../../utils/api';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await safe_fetch('/api/users/logout', { method: 'POST' });
    } catch {
      console.error('Logout failed');
      // Możesz dodać obsługę błędu, np. wyświetlić komunikat użytkownikowi
    }
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return <button onClick={handleLogout}>Logout</button>;
}
