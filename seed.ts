import { db, categories } from './lib/db';
import { auth } from '@/lib/auth';

async function seed() {
  console.log('Seeding database...');

  await auth.api.signUpEmail({
    body: {
      name: 'Administrador',
      email: 'dsc-admin@pucp.edu.pe',
      password: 'admin123',
      role: 'admin',
      description: 'System Administrator',
      isFirstLogin: false,
    },
  });

  const categoryData = [
    { name: 'Tecnología' },
    { name: 'Artes' },
    { name: 'Deportes' },
    { name: 'Académico' },
    { name: 'Social' },
  ];

  for (const cat of categoryData) {
    await db.insert(categories).values(cat);
  }

  console.log('Database seeded successfully!');
  console.log('Admin: dsc-admin@pucp.edu.pe / admin123');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
