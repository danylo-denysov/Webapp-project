import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slide, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthCard from '../../components/auth/AuthCard';
import FormInput from '../../components/auth/FormInput';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message[0] || 'Failed to log in');
      }

      const { accessToken } = await response.json();

      // Save to localStorage so BoardsPage can read it:
      localStorage.setItem('token', accessToken);

      toast.success(
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>✅</span>
        Login successful
      </span>,
      {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: false,
        transition: Slide,
        style: {
          backgroundColor: 'var(--color-cards)',
          color: 'var(--color-text)',
        },
      });

      // Redirect to /boards
      setTimeout(() => {
        navigate('/boards', { replace: true });
      }, 2500);
    } catch (error: any) {
      toast.error(
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>❌</span>
        {error.message || 'An error occurred. Please try again.'}
      </span>,
        {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: false,
        transition: Slide,
        style: {
          backgroundColor: 'var(--color-cards)',
          color: 'var(--color-text)',
        },
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <AuthCard
        title="Login to your account"
        promptText="Don’t have an account?"
        promptLinkText="Sign up for free"
        promptLinkTo="/signup"
        onSubmit={handleSubmit}
      >
        <FormInput
          label="E-mail"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        <FormInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
        />
      </AuthCard>
    </>
  );
}
