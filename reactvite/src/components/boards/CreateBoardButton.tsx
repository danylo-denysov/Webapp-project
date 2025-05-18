import React from 'react';
import plusIcon from '../../assets/plus.svg';
import './CreateBoardButton.css';

interface CreateBoardButtonProps {
  onClick?: () => void;
}

export default function CreateBoardButton({ onClick }: CreateBoardButtonProps) {
  return (
    <button className="create-board-btn" onClick={onClick}>
      <img src={plusIcon} alt="Plus" />
      <span>Create board</span>
    </button>
  );
}
