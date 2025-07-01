import { BackendClient, createBackendClient, ProjectEnvironment } from '@pipedream/sdk/server';

let _pd: BackendClient | undefined;

export function pdClient(): BackendClient {
  if (_pd) return _pd;
  _pd = createBackendClient({
    environment: (process.env.PIPEDREAM_ENVIRONMENT || 'production') as ProjectEnvironment,
    credentials: {
      clientId: process.env.PIPEDREAM_CLIENT_ID || '',
      clientSecret: process.env.PIPEDREAM_CLIENT_SECRET || '',
    },
    projectId: process.env.PIPEDREAM_PROJECT_ID || '',
  });
  return _pd;
}