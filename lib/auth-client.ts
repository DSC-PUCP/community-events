import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/community-events';
const baseURL = typeof window !== 'undefined'
    ? `${window.location.origin}${BASE_PATH}/api/auth`
    : `${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')}/api/auth`;

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
});
