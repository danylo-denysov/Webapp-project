import React from 'react';
import AuthCard from '../../components/auth/AuthCard';
import FormInput from '../../components/auth/FormInput';

export default function SignUpPage() {
  const handleSubmit = () => {
    // TODO: implement sign-up
  };

  return (
    <AuthCard
      title="Create an account"
      promptText="Already have one?"
      promptLinkText="Log in"
      promptLinkTo="/login"
      onSubmit={handleSubmit}
    >
      <FormInput label="Nickname" id="nickname" placeholder="Your nickname" />
      <FormInput label="E-mail" id="email" type="email" placeholder="you@example.com" />
      <FormInput label="Password" id="password" type="password" placeholder="••••••••" />
      <FormInput label="Repeat password" id="repeatPassword" type="password" placeholder="••••••••" />
    </AuthCard>
  );
}