import { env } from '../env';
import * as schema from './schema';
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';

let db;

if (process.env.VERCEL) {
    const { createClient } = await import('@libsql/client');

    const client = createClient({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    });

    db = drizzleLibsql(client, { schema });
} else {
    const Database = (await import('better-sqlite3')).default;
    const sqlite = new Database(env.DATABASE_URL);
    db = drizzleBetterSqlite(sqlite, { schema });
}

export { db };
export * from './schema';