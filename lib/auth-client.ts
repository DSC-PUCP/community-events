import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/community-events';
const baseURL = typeof window !== 'undefined'
    ? `${window.location.origin}${BASE_PATH}/api/auth`
    : `${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')}/api/auth`;

// #region agent log
function debugLog(message: string, data: Record<string, unknown>) {
    if (typeof fetch === 'function') {
        fetch('http://127.0.0.1:7922/ingest/adcbd464-cb24-46e4-82b2-84e4b150a2cd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd32291' },
            body: JSON.stringify({ sessionId: 'd32291', location: 'lib/auth-client.ts', message, data, timestamp: Date.now(), hypothesisId: 'A' }),
        }).catch(() => {});
    }
}
// #endregion

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<typeof auth>()],
});

// #region agent log
if (typeof window !== 'undefined') {
    debugLog('auth-client baseURL resolved', { baseURL, origin: window.location.origin, pathname: window.location.pathname });
}
// #endregion
