import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updateUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // ─── L-7EL HNA: N-9raw localStorage nichan f wost useState ───
  // Haka l-user kay-t3mer f l-blassa 9bel ma l-page t-dir render.
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (err) {
      console.error('Error restoring session:', err);
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  const login = (token: string, userObj: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const updateUser = (updateUser: User) => {
    localStorage.setItem('user', JSON.stringify(updateUser));
    setUser(updateUser);
  };

  // Ila knti baghi t-zid chi khedma k-t-t3tel (b7al appel API API), 
  // had l-code kay-7bess l-page ma-tla3ch 7ta y-sali l-loading.
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1712', fontFamily: 'monospace' }}>
        Authenticating...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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