  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import 'react-toastify/dist/ReactToastify.css';
  import AuthCard from '../../components/auth/AuthCard';
  import FormInput from '../../components/auth/FormInput';
import { toastError, toastSuccess } from '../../utils/toast';
import { NAVIGATION_DELAY } from '../../constants/app';
import { handleApiError } from '../../utils/errorHandler';

  export default function LoginPage() {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/users/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Ensures cookies are sent and received
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          await handleApiError(response);
        }

        // Server sets httpOnly cookies (access_token and refresh_token)
        // No need to handle tokens in JavaScript - they're secure in cookies

        toastSuccess('Login successful');

        // Redirect to /boards
        setTimeout(() => {
          navigate('/boards', { replace: true });
        }, NAVIGATION_DELAY.AFTER_LOGIN);
      } catch (err) {
        const error = err as Error;
        toastError(error.message || 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        <AuthCard
          title="Login to your account"
          promptText="Don't have an account?"
          promptLinkText="Sign up for free"
          promptLinkTo="/signup"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          buttonText={isLoading ? 'Logging in...' : 'Confirm'}
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
