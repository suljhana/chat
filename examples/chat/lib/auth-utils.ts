import 'server-only';

import { auth } from '@/app/(auth)/auth';
import { isAuthRequired } from '@/lib/constants';
import { createGuestSession } from '@/lib/utils';

// Shared helper for API routes to get effective session
export async function getEffectiveSession() {
  const session = await auth();
  
  if (isAuthRequired) {
    return session;
  } else {
    // In dev mode, always return a guest session
    return createGuestSession();
  }
}

// Helper to check if we should persist data
export function shouldPersistData() {
  return isAuthRequired;
}