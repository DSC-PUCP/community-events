import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = toNextJsHandler(auth);

async function withLog(method: 'GET' | 'POST', request: Request) {
    // #region agent log
    const url = request.url;
    const pathname = typeof (request as Request & { nextUrl?: { pathname?: string } }).nextUrl?.pathname !== 'undefined'
        ? (request as Request & { nextUrl: { pathname: string } }).nextUrl.pathname
        : new URL(url).pathname;
    console.log('[auth-route]', method, { url, pathname });
    try {
        const res = await (method === 'GET' ? handler.GET(request) : handler.POST(request));
        console.log('[auth-route]', method, 'status', res?.status);
        return res;
    } catch (e) {
        console.log('[auth-route]', method, 'error', e);
        throw e;
    }
    // #endregion
}

export const GET = (request: Request) => withLog('GET', request);
export const POST = (request: Request) => withLog('POST', request);