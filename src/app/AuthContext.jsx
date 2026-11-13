import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './authContextInstance.js';
import { useAuth } from './useAuth.js';

const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Pramod',
  email: 'pramod@example.com',
  title: 'Delphi Scholar',
  avatarUrl: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mindmate_user');
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, _password) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const loggedUser = {
      ...DEFAULT_USER,
      email: email.trim(),
    };
    setUser(loggedUser);
    localStorage.setItem('mindmate_user', JSON.stringify(loggedUser));
    setLoading(false);
    return loggedUser;
  };

  const signup = async (email, _password) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim(),
      title: 'New Scholar',
      avatarUrl: null,
    };
    setUser(newUser);
    localStorage.setItem('mindmate_user', JSON.stringify(newUser));
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindmate_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-parchment">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
