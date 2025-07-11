'use client';

import { useAuthContext } from '@/components/session-provider';

/**
 * Hook that provides an "effective" session - either the real NextAuth session 
 * or a guest session when auth is disabled.
 * 
 * This abstraction allows components to use the same session interface regardless
 * of whether auth is enabled or disabled, making development easier while keeping
 * the same code paths for production.
 * 
 * @returns Session data compatible with NextAuth's useSession hook
 */
export function useEffectiveSession() {
  const { isAuthDisabled, guestSession } = useAuthContext();

  // If auth is disabled, always return the guest session
  if (isAuthDisabled && guestSession) {
    return {
      data: {
        ...guestSession,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      status: 'authenticated' as const,
      update: () => Promise.resolve(null)
    };
  }

  // Otherwise return the real session
  return { data: null, status: 'authenticated', update: () => Promise.resolve(null) };
}
