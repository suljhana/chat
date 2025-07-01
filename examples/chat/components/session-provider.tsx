'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { createContext, useContext } from 'react';

type AuthContextType = {
  isAuthRequired: boolean;
  guestSession?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

const AuthContext = createContext<AuthContextType>({ isAuthRequired: true });

export function SessionProvider({ 
  children, 
  isAuthRequired, 
  guestSession 
}: { 
  children: React.ReactNode;
  isAuthRequired: boolean;
  guestSession?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}) {
  // For NextAuth, we need to provide a full session object with expires
  const session = isAuthRequired ? undefined : (guestSession ? {
    ...guestSession,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  } : undefined);
  
  
  return (
    <AuthContext.Provider value={{ isAuthRequired, guestSession }}>
      <NextAuthSessionProvider session={session}>
        {children}
      </NextAuthSessionProvider>
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}