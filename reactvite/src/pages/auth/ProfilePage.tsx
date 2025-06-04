import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import arrowLeftIcon from '../../assets/arrow-left.svg';

import './ProfilePage.css';

import ChangeNicknameModal from '../../components/auth/ChangeNicknameModal';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import DeleteAccountModal from '../../components/auth/DeleteAccountModal';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleChangeProfilePicture = () => {
    console.log('Change profile picture…');
  };

  const handleChangeNickname = (newNickname: string) => {
    // TODO: backend
   console.log('New nickname:', newNickname);
 };

  const handleChangePassword = (current: string, next: string) => {
   // TODO: backend
   console.log('Change password from', current, '→', next);
 };

  const handleDeleteAccount = () => {
   // TODO: backend
   console.log('Account deletion confirmed');
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
        right={<Avatar />}
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
