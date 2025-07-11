import 'server-only';

import { isPersistenceDisabled } from '@/lib/constants';

// Helper to check if we should persist data to database
export function shouldPersistData() {
  return !isPersistenceDisabled;
}

// In development, we can disable auth and use a mock session
export async function getEffectiveSession() {
  if (isPersistenceDisabled) {
    // Return a mock session that mimics a logged-in user
    return {
      user: {
        id: '12345',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }
  // In production, or when auth is enabled, this should be implemented
  // with a real auth provider, e.g., NextAuth.js or Clerk.
  // For now, we'll return a null session.
  return null;
}
