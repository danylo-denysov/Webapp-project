import { ReactNode } from 'react';
import './AuthCard.css';

interface AuthCardProps {
  title: string;
  promptText: string;
  promptLinkText: string;
  promptLinkTo: string;
  children: ReactNode;
  onSubmit: () => void;
}

export default function AuthCard({
  title,
  promptText,
  promptLinkText,
  promptLinkTo,
  children,
  onSubmit,
}: AuthCardProps) {
  return (
    <div className="auth-card">
      <div className="header">
        <h1>{title}</h1>
        <p>
          {promptText}{' '}
          <a href={promptLinkTo}>{promptLinkText}</a>
        </p>
      </div>
      <div className="body">{children}</div>
      <button className="submit-btn" onClick={onSubmit}>
        Confirm
      </button>
    </div>
  );
}