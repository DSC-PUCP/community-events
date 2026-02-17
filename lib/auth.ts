import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    basePath: "/api/auth",
    database: drizzleAdapter(db, {
        provider: "sqlite",
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
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "organization",
            },
            name: {
                type: "string",
                required: false,
            },
            description: {
                type: "string",
                required: false,
            },
            contacts: {
                type: "string",
                required: false,
            },
            isFirstLogin: {
                type: "boolean",
                required: true,
                defaultValue: true,
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session;