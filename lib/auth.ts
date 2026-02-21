import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      users: schema.organizations,
      sessions: schema.sessions,
      accounts: schema.accounts,
      verifications: schema.verifications,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail && user.email === adminEmail) {
            return {
              data: {
                ...user,
                role: 'admin',
                isFirstLogin: false,
              },
            };
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'organization',
      },
      name: {
        type: 'string',
        required: false,
      },
      description: {
        type: 'string',
        required: false,
      },
      contacts: {
        type: 'string',
        required: false,
      },
      isFirstLogin: {
        type: 'boolean',
        required: true,
        defaultValue: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
