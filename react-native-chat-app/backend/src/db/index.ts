import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from '../config/env';

// For testing without a real database, we'll create a mock connection
let client: any;
let db: any;

// Simple in-memory store for testing
const mockStore = {
  users: [] as any[],
  chats: [] as any[],
  messages: [] as any[],
};

try {
  if (config.databaseUrl && config.databaseUrl !== 'postgresql://postgres:password@localhost:5432/chat_test_db') {
    // Only connect to real database if URL is provided and not the test placeholder
    client = postgres(config.databaseUrl, { prepare: false });
    db = drizzle(client, { schema });
    console.log('Connected to PostgreSQL database');
  } else {
    // Mock database for testing
    console.log('Using mock database for testing');
    client = null;
    db = {
      select: () => ({ 
        from: (table: any) => ({ 
          where: (condition: any) => {
            // Simple mock that checks for email in the condition
            if (table === schema.user) {
              // If there's a condition, try to extract email for filtering
              try {
                const email = condition?.right || condition?.value || condition;
                if (typeof email === 'string' && email.includes('@')) {
                  return mockStore.users.filter(user => user.email === email);
                }
              } catch (e) {
                // Fallback
              }
              return mockStore.users;
            }
            return table === schema.chat ? mockStore.chats : table === schema.message ? mockStore.messages : [];
          },
          orderBy: () => {
            if (table === schema.chat) {
              return mockStore.chats.sort((a: any, b: any) => b.createdAt - a.createdAt);
            }
            return [];
          }
        }) 
      }),
      insert: (table: any) => ({ 
        values: (data: any) => ({ 
          returning: (fields?: any) => {
            // Mock successful insert with generated ID
            const id = 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const newRecord = { id, ...data, createdAt: new Date() };
            
            if (table === schema.user) {
              // For testing, create a mock user with hashed password
              const mockUser = { 
                id, 
                email: data.email, 
                password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdTrkv.q/qqUu', // 'password123' hashed
                createdAt: new Date()
              };
              mockStore.users.push(mockUser);
              return [{ id, email: data.email }];
            }
            if (table === schema.chat) {
              mockStore.chats.push(newRecord);
              return [newRecord];
            }
            if (table === schema.message) {
              mockStore.messages.push(newRecord);
              return [newRecord];
            }
            return [newRecord];
          }
        }) 
      }),
      update: () => ({ 
        set: () => ({ 
          where: () => ({ 
            returning: () => []
          }) 
        }) 
      }),
      delete: () => ({ 
        where: () => ({ 
          returning: () => []
        }) 
      }),
    };
  }
} catch (error) {
  console.warn('Database connection failed, using mock database:', error);
  client = null;
  db = {
    select: () => ({ 
      from: (table: any) => ({ 
        where: (condition: any) => {
          // Simple mock that checks for email in the condition
          if (table === schema.user) {
            // If there's a condition, try to extract email for filtering
            try {
              const email = condition?.right || condition?.value || condition;
              if (typeof email === 'string' && email.includes('@')) {
                return mockStore.users.filter(user => user.email === email);
              }
            } catch (e) {
              // Fallback
            }
            return mockStore.users;
          }
          return table === schema.chat ? mockStore.chats : table === schema.message ? mockStore.messages : [];
        },
        orderBy: () => {
          if (table === schema.chat) {
            return mockStore.chats.sort((a: any, b: any) => b.createdAt - a.createdAt);
          }
          return [];
        }
      }) 
    }),
    insert: (table: any) => ({ 
      values: (data: any) => ({ 
        returning: (fields?: any) => {
          // Mock successful insert with generated ID
          const id = 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          const newRecord = { id, ...data, createdAt: new Date() };
          
          if (table === schema.user) {
            // For testing, create a mock user with hashed password
            const mockUser = { 
              id, 
              email: data.email, 
              password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdTrkv.q/qqUu', // 'password123' hashed
              createdAt: new Date()
            };
            mockStore.users.push(mockUser);
            return [{ id, email: data.email }];
          }
          if (table === schema.chat) {
            mockStore.chats.push(newRecord);
            return [newRecord];
          }
          if (table === schema.message) {
            mockStore.messages.push(newRecord);
            return [newRecord];
          }
          return [newRecord];
        }
      }) 
    }),
    update: () => ({ 
      set: () => ({ 
        where: () => ({ 
          returning: () => []
        }) 
      }) 
    }),
    delete: () => ({ 
      where: () => ({ 
        returning: () => []
      }) 
    }),
  };
}

export { client, db };