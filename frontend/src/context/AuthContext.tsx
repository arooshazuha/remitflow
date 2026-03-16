"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  email: string | null;
  kycStatus: string | null;
  login: (token: string, userId: string, email: string, kycStatus: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check local storage on initial load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setUserId(localStorage.getItem('userId'));
      setEmail(localStorage.getItem('email'));
      setKycStatus(localStorage.getItem('kycStatus'));
    }
  }, []);

  const login = (newToken: string, newUserId: string, newEmail: string, newKycStatus: string) => {
    setToken(newToken);
    setUserId(newUserId);
    setEmail(newEmail);
    setKycStatus(newKycStatus);
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('email', newEmail);
    localStorage.setItem('kycStatus', newKycStatus);
    
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setEmail(null);
    setKycStatus(null);
    localStorage.clear();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, userId, email, kycStatus, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
