import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '@/lib/auth';

const baseURL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/community-events/api/auth`
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/community-events/api/auth`;

export const { signIn, signUp, signOut, useSession, getSession } =
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
  });
