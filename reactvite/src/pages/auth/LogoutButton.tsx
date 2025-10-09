import { useNavigate } from 'react-router-dom';
import { safe_fetch } from '../../utils/api';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await safe_fetch('/api/users/logout', { method: 'POST' });
    } catch (err) {
      // Logout API call failed, but still navigate to login
      // Cookies may have been cleared server-side already
    }
    // httpOnly cookies are cleared by server
    navigate('/login', { replace: true });
  };

  return <button onClick={handleLogout}>Logout</button>;
}
