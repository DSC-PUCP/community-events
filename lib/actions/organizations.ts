'use server';

import { db, Organization, organizations } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth';

type ChangePasswordResult =
  | { success: true }
  | { success: false; error: 'INVALID_CURRENT_PASSWORD' };

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getOrganizationsForFilter() {
  const orgs = await db
    .select()
    .from(organizations)
    .where(eq(organizations.role, 'organization'));

  return orgs.map((org) => ({
    id: org.id,
    name: org.name,
  }));
}

export async function getAllOrganizations(): Promise<Organization[]> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  return db.select().from(organizations);
}

export async function getOrganizationById(
  id: string,
): Promise<Organization | null> {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return org || null;
}

export async function updateOrganization(
  id: string,
  data: Partial<Organization>,
) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Debe ser admin o la cuenta de la org para poder hacer update
  if (session.user.role !== 'admin' && session.user.id !== id) {
    throw new Error('Unauthorized');
  }

  await db
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id));

  revalidatePath('/dashboard');
}

export async function createOrganization(email: string, tempPassword?: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const password = tempPassword || Math.random().toString(36).slice(-8);

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: email.split('@')[0],
      },
    });

    await db
      .update(organizations)
      .set({
        isFirstLogin: true,
        role: 'organization',
      })
      .where(eq(organizations.email, email));

    revalidatePath('/dashboard');

    return {
      success: true,
      tempPassword: password,
      message: `Organization created. Temporary password: ${password}`,
    };
  } catch (error: unknown) {
    throw new Error(
      (error as Error).message || 'Failed to create organization',
    );
  }
}

export async function deleteOrganization(id: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db.delete(organizations).where(eq(organizations.id, id));
  revalidatePath('/dashboard');
}

export async function changePassword(
  newPassword: string,
  currentPassword: string,
): Promise<ChangePasswordResult> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
      },
      headers: await headers(),
    });
  } catch (e) {
    if (!(e instanceof APIError) || e.statusCode !== 400) throw e;
    return { success: false, error: 'INVALID_CURRENT_PASSWORD' };
  }

  await db
    .update(organizations)
    .set({
      isFirstLogin: false,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, session.user.id));

  revalidatePath('/dashboard');

  return { success: true };
}
