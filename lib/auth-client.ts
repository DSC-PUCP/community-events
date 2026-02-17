import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

const baseURL = typeof window !== 'undefined'
    ? `${window.location.origin}/community-events/api/auth`
    : 'http://localhost:3000/community-events/api/auth';

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
});
