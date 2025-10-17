import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
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
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  }, [formData.nickname, formData.email, formData.password, formData.repeatPassword, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  }, [isLoading, handleSubmit]);

  return (
    <>
      <AuthCard
        title="Create an account"
        promptText="Already have one?"
        promptLinkText="Log in"
        promptLinkTo="/login"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={isLoading ? 'Creating account...' : 'Confirm'}
      >
        <FormInput
          label="Nickname"
          id="nickname"
          placeholder="Your nickname"
          value={formData.nickname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <FormInput
          label="E-mail"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <FormInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <FormInput
          label="Repeat password"
          id="repeatPassword"
          type="password"
          placeholder="••••••••"
          value={formData.repeatPassword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </AuthCard>
    </>
  );
}