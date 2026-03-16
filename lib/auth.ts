import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { i18n } from '@better-auth/i18n';

const trustedOrigins = ['http://localhost:3000'];
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  trustedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
}
if (process.env.VERCEL_URL) {
  trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}
if (process.env.VERCEL_BRANCH_URL) {
  trustedOrigins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
}

export const auth = betterAuth({
  baseURL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000',
  basePath: '/api/auth',
  trustedOrigins,
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
                isFirstLogin: user.isFirstLogin ?? false,
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
  plugins: [
    i18n({
      translations: {
        es: {
          USER_NOT_FOUND: 'Usuario no encontrado',
          FAILED_TO_CREATE_USER: 'No se pudo crear el usuario',
          FAILED_TO_CREATE_SESSION: 'No se pudo crear la sesión',
          FAILED_TO_UPDATE_USER: 'No se pudo actualizar el usuario',
          FAILED_TO_GET_SESSION: 'No se pudo obtener la sesión',
          INVALID_PASSWORD: 'Contraseña inválida',
          INVALID_EMAIL: 'Correo inválido',
          INVALID_EMAIL_OR_PASSWORD: 'Correo o contraseña inválido',
          INVALID_USER: 'Usuario inválido',
          SOCIAL_ACCOUNT_ALREADY_LINKED: 'La cuenta social ya esta vinculada',
          PROVIDER_NOT_FOUND: 'Proveedor no encontrado',
          INVALID_TOKEN: 'Token inválido',
          TOKEN_EXPIRED: 'El token ha expirado',
          ID_TOKEN_NOT_SUPPORTED: 'id_token no soportado',
          FAILED_TO_GET_USER_INFO:
            'No se pudo obtener la información del usuario',
          USER_EMAIL_NOT_FOUND: 'No se encontró el correo del usuario',
          EMAIL_NOT_VERIFIED: 'El correo no esta verificado',
          PASSWORD_TOO_SHORT: 'La contraseña es demasiado corta',
          PASSWORD_TOO_LONG: 'La contraseña es demasiado larga',
          USER_ALREADY_EXISTS: 'El usuario ya existe.',
          USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
            'El usuario ya existe. Usa otro correo.',
          EMAIL_CAN_NOT_BE_UPDATED: 'El correo no se puede actualizar',
          CREDENTIAL_ACCOUNT_NOT_FOUND: 'Cuenta de credenciales no encontrada',
          SESSION_EXPIRED:
            'La sesión ha expirado. Vuelve a autenticarte para realizar esta accion.',
          FAILED_TO_UNLINK_LAST_ACCOUNT:
            'No puedes desvincular tu última cuenta',
          ACCOUNT_NOT_FOUND: 'Cuenta no encontrada',
          USER_ALREADY_HAS_PASSWORD:
            'El usuario ya tiene una contraseña. Proporciónala para eliminar la cuenta.',
          CROSS_SITE_NAVIGATION_LOGIN_BLOCKED:
            'Inicio de sesión bloqueado por navegación entre sitios.',
          VERIFICATION_EMAIL_NOT_ENABLED:
            'El correo de verificacion no esta habilitado',
          EMAIL_ALREADY_VERIFIED: 'El correo ya esta verificado',
          EMAIL_MISMATCH: 'Los correos electronicos no coinciden',
          SESSION_NOT_FRESH: 'La sesión no es reciente',
          LINKED_ACCOUNT_ALREADY_EXISTS: 'La cuenta vinculada ya existe',
          INVALID_ORIGIN: 'Origen inválido',
          INVALID_CALLBACK_URL: 'callbackURL inválida',
          INVALID_REDIRECT_URL: 'redirectURL inválida',
          INVALID_ERROR_CALLBACK_URL: 'errorCallbackURL inválida',
          INVALID_NEW_USER_CALLBACK_URL: 'newUserCallbackURL inválida',
          MISSING_OR_NULL_ORIGIN: 'Origin faltante o nulo',
          CALLBACK_URL_REQUIRED: 'callbackURL es obligatorio',
          FAILED_TO_CREATE_VERIFICATION: 'No se pudo crear la verificacion',
          FIELD_NOT_ALLOWED: 'No se permite establecer este campo',
          ASYNC_VALIDATION_NOT_SUPPORTED:
            'La validacion asincrona no esta soportada',
          VALIDATION_ERROR: 'Error de validacion',
          MISSING_FIELD: 'El campo es obligatorio',
          METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED:
            'El metodo POST requiere deferSessionRefresh habilitado en la configuración de sesión',
          BODY_MUST_BE_AN_OBJECT: 'El body debe ser un objeto',
          PASSWORD_ALREADY_SET:
            'El usuario ya tiene una contraseña configurada',
        },
      },
      detection: ['session', 'header'],
      defaultLocale: 'es',
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
