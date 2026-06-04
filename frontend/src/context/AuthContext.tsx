import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        localStorage.setItem('token', session.access_token);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || '',
            email: session.user.email || '',
            role: 'CUSTOMER',
            avatar: session.user.user_metadata?.avatar_url
          });
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        localStorage.setItem('token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const login = (token: string, userObj: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const updateUser = (updateUser: User) => {
    localStorage.setItem('user', JSON.stringify(updateUser));
    setUser(updateUser);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF9] gap-6">

        {/* Spinner with pulse ring */}
        <div className="relative flex items-center justify-center">
          <span className="absolute w-20 h-20 rounded-full bg-[#C4631C]/10 animate-ping" />
          <div className="w-14 h-14 rounded-full bg-[#FFF4E5] border border-[#F5D09A] flex items-center justify-center shadow-[0_4px_20px_rgba(196,99,28,0.12)]">
            {/* Spinning arc */}
            <svg
              width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#C4631C" strokeWidth="2" strokeLinecap="round"
              className="animate-spin"
              style={{ animationDuration: '0.85s' }}
            >
              {/* Full faint circle */}
              <circle cx="12" cy="12" r="10" strokeOpacity="0.15" />
              {/* Arc */}
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        </div>

        {/* Brand name + subtitle */}
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-2xl font-bold text-[#1C1712]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
          >
            Deer Goods
          </p>
          <p className="text-[13px] text-[#9C8E80] font-medium tracking-wide">
            Authenticating your session…
          </p>
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#C4631C]"
              style={{ animation: `dg-bounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </div>

        <style>{`
          @keyframes dg-bounce {
            0%, 80%, 100% { transform: scale(0.5); opacity: 0.35; }
            40%            { transform: scale(1);   opacity: 1;    }
          }
        `}</style>
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