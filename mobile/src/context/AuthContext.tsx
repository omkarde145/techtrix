import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  inspectorName: string;
  inspectorBadge: string;
  adminDscPin: string;
  isDscVerified: boolean;
  verifyDscPin: (pin: string) => boolean;
  logoutDsc: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('inspector');
  const [isDscVerified, setIsDscVerified] = useState<boolean>(false);

  const verifyDscPin = (pin: string): boolean => {
    if (pin.trim() === '2024') {
      setIsDscVerified(true);
      return true;
    }
    return false;
  };

  const logoutDsc = () => {
    setIsDscVerified(false);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        inspectorName: 'Devendra Sharma (JE)',
        inspectorBadge: 'FO-8821',
        adminDscPin: '2024',
        isDscVerified,
        verifyDscPin,
        logoutDsc,
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
