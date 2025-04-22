import React from 'react';
import AuthCard from '../../components/auth/AuthCard';
import FormInput from '../../components/auth/FormInput';

export default function LoginPage() {
  const handleSubmit = () => {
    // TODO: implement login
  };

  return (
    <AuthCard
      title="Login to your account"
      promptText="Don’t have an account?"
      promptLinkText="Sign up for free"
      promptLinkTo="/signup"
      onSubmit={handleSubmit}
    >
      <FormInput label="E-mail" id="email" type="email" placeholder="you@example.com" />
      <FormInput label="Password" id="password" type="password" placeholder="••••••••" />
    </AuthCard>
  );
}