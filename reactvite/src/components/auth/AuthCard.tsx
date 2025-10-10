import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './AuthCard.css';

interface AuthCardProps {
  title: string;
  promptText: string;
  promptLinkText: string;
  promptLinkTo: string;
  children: ReactNode;
  onSubmit: () => void;
  isLoading?: boolean;
  buttonText?: string;
}

export default function AuthCard({
  title,
  promptText,
  promptLinkText,
  promptLinkTo,
  children,
  onSubmit,
  isLoading = false,
  buttonText = 'Confirm',
}: AuthCardProps) {
  return (
    <div className="auth-card">
      <div className="header">
        <h1>{title}</h1>
        <p>
          {promptText}{' '}
          <Link to={promptLinkTo}>{promptLinkText}</Link>
        </p>
      </div>
      <div className="body">{children}</div>
      <button className="submit-btn" onClick={onSubmit} disabled={isLoading}>
        {buttonText}
      </button>
    </div>
  );
}