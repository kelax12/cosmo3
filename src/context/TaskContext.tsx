import React, { createContext, useContext } from 'react';
import { useAuth } from '../modules/auth/AuthContext';

export const TaskContext = createContext<any>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const value = {
    user: auth.user,
    loading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isDemo: auth.isDemo,
    login: auth.login,
    register: auth.register,
    loginWithGoogle: auth.loginWithGoogle,
    logout: auth.logout,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
