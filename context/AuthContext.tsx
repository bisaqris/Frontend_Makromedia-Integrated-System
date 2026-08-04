'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, startTransition } from 'react';
import { User, Role } from '@/types/user';
import { getToken, getUser, setToken as saveToken, setUser as saveUser, clearAuth } from '@/lib/auth';
import { hasAccess as checkHasAccess } from '@/lib/roles';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasAccess: (allowedRoles: Role[]) => boolean;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const cachedToken = getToken();
    const cachedUser = getUser();

    startTransition(() => {
      if (cachedToken && cachedUser) {
        setTokenState(cachedToken);
        setUserState(cachedUser);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    saveToken(newToken);
    saveUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
  }, []);

  const updateUser = useCallback((updated: Partial<User>) => {
    setUserState((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updated };
      saveUser(nextUser);
      return nextUser;
    });
  }, []);

  const hasAccess = useCallback(
    (allowedRoles: Role[]): boolean => {
      return checkHasAccess(user?.role ?? null, allowedRoles);
    },
    [user?.role]
  );

  const role = user?.role ?? null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasAccess,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
