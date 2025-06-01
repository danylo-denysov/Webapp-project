import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slide, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthCard from '../../components/auth/AuthCard';
import FormInput from '../../components/auth/FormInput';
import { toastError, toastSuccess } from '../../utils/toast';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    repeatPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {

    try {
      if (formData.password !== formData.repeatPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.nickname,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message[0] || 'Failed to sign up');
      }

      toastSuccess('Account created');

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toastError(error.message || 'Failed to create account');
    }
  };

  return (
    <>
      <AuthCard
        title="Create an account"
        promptText="Already have one?"
        promptLinkText="Log in"
        promptLinkTo="/login"
        onSubmit={handleSubmit}
      >
        <FormInput
          label="Nickname"
          id="nickname"
          placeholder="Your nickname"
          value={formData.nickname} // Bind to formData
          onChange={handleChange} // Update formData on input change
        />
        <FormInput
          label="E-mail"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email} // Bind to formData
          onChange={handleChange} // Update formData on input change
        />
        <FormInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password} // Bind to formData
          onChange={handleChange} // Update formData on input change
        />
        <FormInput
          label="Repeat password"
          id="repeatPassword"
          type="password"
          placeholder="••••••••"
          value={formData.repeatPassword} // Bind to formData
          onChange={handleChange} // Update formData on input change
        />
      </AuthCard>
    </>
  );
}