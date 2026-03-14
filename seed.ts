import { categories, db, organizations } from './lib/db';
import { auth } from '@/lib/auth';
import { env } from './lib/env';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Cargando seed...');

  const adminEmail = env.ADMIN_EMAIL;
  if (adminEmail) {
    const existingAdmin = await db.query.organizations.findFirst({
      where: eq(organizations.email, adminEmail),
      columns: { id: true, email: true },
    });

    const envAdminPassword = env.ADMIN_PASSWORD;
    const adminPassword =
      envAdminPassword ?? randomBytes(24).toString('base64url');
    const forcePasswordChange = !envAdminPassword;

    if (!existingAdmin) {
      await auth.api.signUpEmail({
        body: {
          name: 'Administrador',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          description: 'System Administrator',
          isFirstLogin: forcePasswordChange,
        },
      });

      if (forcePasswordChange) {
        console.log(
          `Admin bootstrap password (${adminEmail}): ${adminPassword}`,
        );
        console.log(
          'La cuenta admin debe cambiar su contraseña en el primer login.',
        );
      } else {
        console.log(
          `Cuenta admin creada para ${adminEmail} con contraseña provista.`,
        );
      }
    } else {
      await db
        .update(organizations)
        .set({ role: 'admin' })
        .where(eq(organizations.id, existingAdmin.id));

      console.log(
        `Cuenta admin ya existente para ${adminEmail}; rol admin verificado.`,
      );
      if (envAdminPassword) {
        console.log(
          'Se detectó password por CLI/env, pero no se modifica la clave de una cuenta existente.',
        );
      }
    }
  } else {
    console.log(
      'ADMIN_EMAIL no configurado: se omitió la creacion de la cuenta admin.',
    );
  }

  const categoryData = [
    { name: 'Tecnología' },
    { name: 'Artes' },
    { name: 'Deportes' },
    { name: 'Académico' },
    { name: 'Social' },
  ];

  for (const cat of categoryData) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  console.log('Seed completado!');
}

seed().catch((error) => {
  console.error('Error al hacer seed:', error);
  process.exit(1);
});
