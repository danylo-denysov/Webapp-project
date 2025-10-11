import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import arrowLeftIcon from '../../assets/arrow-left.svg';
import logoutIcon from '../../assets/logout.svg';

import './ProfilePage.css';

import ChangeNicknameModal from '../../components/auth/ChangeNicknameModal';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import DeleteAccountModal from '../../components/auth/DeleteAccountModal';
import { safe_fetch } from '../../utils/api';
import { toastError } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleChangeProfilePicture = () => {
    console.log('Change profile picture…');
  };

  const handleChangeNickname = async (newNickname: string) => {
    const res = await safe_fetch('/api/users/me/nickname', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newNickname }),
    });
    if (!res.ok) {
      await handleApiError(res);
    }
  };

  const handleChangePassword = async (
    current: string,
    next: string
  ) => {
    const res = await safe_fetch('/api/users/me/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: current,
        newPassword: next,
        repeatPassword: next,
      }),
    });
    if (!res.ok) {
      await handleApiError(res);
    }
  };

  const handleDeleteAccount = async () => {
    const res = await safe_fetch('/api/users/me', {
      method: 'DELETE',
    });
    if (!res.ok) {
      await handleApiError(res);
    }
    // httpOnly cookies are cleared automatically on account deletion
    navigate('/', { replace: true });
  };

    const handleLogout = async () => {
    try {
      const res = await safe_fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to log out');
      }
      // httpOnly cookies are cleared by server
      navigate('/login', { replace: true });
    } catch (err) {
      const error = err as Error;
      toastError(error.message);
    }
  };

  return (
    <div className="profile-page">
      <Header
        left={
          <button
            className="profile-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={arrowLeftIcon} alt="Back" />
          </button>
        }
        right={
          <>
            <button
              className="profile-logout-button"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <img src={logoutIcon} alt="Logout" />
            </button>


            <Avatar />
          </>
        }
      />

      <div className="profile-card">
        <h2 className="profile-card__title">Account options</h2>

        <button
          className="profile-card__btn"
          onClick={handleChangeProfilePicture}
        >
          Change profile picture
        </button>

        <button
          className="profile-card__btn"
          onClick={() => setIsNicknameModalOpen(true)}
        >
          Change nickname
        </button>

        <button
          className="profile-card__btn"
          onClick={() => setIsPasswordModalOpen(true)}
        >
          Change password
        </button>

        <button
          className="profile-card__btn profile-card__btn--danger"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Delete account
        </button>
      </div>

      <ChangeNicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onConfirm={handleChangeNickname}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleChangePassword}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
