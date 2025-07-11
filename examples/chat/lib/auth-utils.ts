import 'server-only';

import { isPersistenceDisabled } from '@/lib/constants';

// Helper to check if we should persist data to database
export function shouldPersistData() {
  return !isPersistenceDisabled;
}
