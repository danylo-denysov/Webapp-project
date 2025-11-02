import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import arrowLeftIcon from '../../assets/arrow-left.svg';
import logoutIcon from '../../assets/logout.svg';

import './ProfilePage.css';

import ChangeNicknameModal from '../../components/auth/ChangeNicknameModal';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import ChangeProfilePictureModal from '../../components/auth/ChangeProfilePictureModal';
import DeleteAccountModal from '../../components/auth/DeleteAccountModal';
import LogoutModal from '../../components/auth/LogoutModal';
import { safe_fetch } from '../../utils/api';
import { toastError } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    profile_picture: string | null;
    created_at: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await safe_fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleChangeProfilePicture = async (newProfilePicture: string) => {
    const res = await safe_fetch('/api/users/me/profile-picture', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profilePicture: newProfilePicture }),
    });
    if (!res.ok) {
      await handleApiError(res);
    } else {
      setUserData(prev => prev ? { ...prev, profile_picture: newProfilePicture } : null);
    }
  };

  const handleChangeNickname = async (newNickname: string) => {
    const res = await safe_fetch('/api/users/me/nickname', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newNickname }),
    });
    if (!res.ok) {
      await handleApiError(res);
    } else {
      setUserData(prev => prev ? { ...prev, username: newNickname } : null);
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
          <button
            className="profile-logout-button"
            onClick={() => setIsLogoutModalOpen(true)}
            aria-label="Log out"
          >
            <img src={logoutIcon} alt="Logout" />
          </button>
        }
      />

      <div className="profile-content">
        <div className="profile-card">
          <h2 className="profile-card__title">Account information</h2>
          <div className="profile-info">
            <div className="profile-info__avatar">
              <Avatar size={120} profilePicture={userData?.profile_picture} />
            </div>
            <div className="profile-info__details">
              <div className="profile-info__item">
                <span className="profile-info__label">Nickname</span>
                <span className="profile-info__value">{userData?.username || '...'}</span>
              </div>
              <div className="profile-info__item">
                <span className="profile-info__label">Email</span>
                <span className="profile-info__value">{userData?.email || '...'}</span>
              </div>
              <div className="profile-info__item">
                <span className="profile-info__label">Member since</span>
                <span className="profile-info__value">
                  {userData?.created_at
                    ? new Date(userData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-card__title">Account options</h2>

        <button
          className="profile-card__btn"
          onClick={() => setIsProfilePictureModalOpen(true)}
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
      </div>

      <ChangeProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onConfirm={handleChangeProfilePicture}
        currentProfilePicture={userData?.profile_picture}
      />

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

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
