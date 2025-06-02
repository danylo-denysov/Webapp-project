import React from 'react';
import { Navigate } from 'react-router-dom';

// Check if user is authenticated by verifying the presence of a token in localStorage
// If no token is found, redirect to the login page
export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
