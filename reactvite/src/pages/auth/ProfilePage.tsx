import React from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import arrowLeftIcon from '../../assets/arrow-left.svg';

import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();

  const handleChangeProfilePicture = () => {
    console.log('Change profile picture…');
  };

  const handleChangeNickname = () => {
    console.log('Change nickname…');
  };

  const handleChangePassword = () => {
    console.log('Change password…');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account…');
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
          onClick={handleChangeNickname}
        >
          Change nickname
        </button>

        <button
          className="profile-card__btn"
          onClick={handleChangePassword}
        >
          Change password
        </button>

        <button
          className="profile-card__btn profile-card__btn--danger"
          onClick={handleDeleteAccount}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
