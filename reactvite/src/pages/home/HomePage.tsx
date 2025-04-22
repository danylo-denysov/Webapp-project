import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="main-container">
      <button
        className="start-button"
        onClick={() => navigate('/signup')}
      >
        Create an account
      </button>
      <button
        className="start-button"
        onClick={() => navigate('/login')}
      >
        Login to your account
      </button>
    </div>
  );
}