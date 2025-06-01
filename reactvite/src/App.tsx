import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';
import StartPage from './pages/StartPage';
import BoardsPage from './pages/boards/BoardsPage';
import TasksPage   from './pages/boards/TasksPage'
import { ToastContainer, Slide } from 'react-toastify';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        icon={false}
        transition={Slide}
      />
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:boardId" element={<TasksPage  />} />
      </Routes>
    </BrowserRouter>
  );
}