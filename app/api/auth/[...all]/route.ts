import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = toNextJsHandler(auth);

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/community-events';

/** Next.js strips basePath before the request reaches the handler; Better Auth expects baseURL+basePath in the URL. Rewrite the request URL so auth sees /community-events/api/auth/... */
function rewriteRequestUrl(request: Request): Request {
    const url = new URL(request.url);
    if (url.pathname.startsWith(BASE_PATH)) return request;
    if (!url.pathname.startsWith('/api/auth')) return request;
    const newPath = BASE_PATH + url.pathname;
    const newUrl = url.origin + newPath + url.search;
    return new Request(newUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.body ? request.body : undefined,
    });
}

async function withLog(method: 'GET' | 'POST', request: Request) {
    // #region agent log
    const pathname = new URL(request.url).pathname;
    console.log('[auth-route]', method, { url: request.url, pathname });
    // #endregion
    const authRequest = rewriteRequestUrl(request);
    try {
        const res = await (method === 'GET' ? handler.GET(authRequest) : handler.POST(authRequest));
        // #region agent log
        console.log('[auth-route]', method, 'status', res?.status);
        // #endregion
        return res;
    } catch (e) {
        // #region agent log
        console.log('[auth-route]', method, 'error', e);
        // #endregion
        throw e;
    }
}

export const GET = (request: Request) => withLog('GET', request);
export const POST = (request: Request) => withLog('POST', request);