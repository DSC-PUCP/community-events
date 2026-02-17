import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().default('data.db'),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
    UPLOAD_DIR: z.string().default('./public/uploads'),
});

export const env = envSchema.parse(process.env);