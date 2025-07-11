'use client';

import { createContext, useContext } from 'react';
import { GuestSession } from '@/types/user';

type AuthContextType = {
  isAuthDisabled: boolean;
  isPersistenceDisabled: boolean;
  guestSession?: GuestSession;
};

const AuthContext = createContext<AuthContextType>({ isAuthDisabled: false, isPersistenceDisabled: false });

export function useAuthContext() {
  return useContext(AuthContext);
}
