'use server';

import { db, Event, events, NewEvent } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { saveImage } from '@/lib/upload';
import sharp from 'sharp';

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAllEvents(): Promise<Event[]> {
  return await db.select().from(events).orderBy(desc(events.startDate));
}

export async function getEventById(id: string): Promise<Event | null> {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  return event || null;
}

export async function getEventsByOrgId(orgId: string): Promise<Event[]> {
  return db.select().from(events).where(eq(events.orgId, orgId));
}

export async function createEvent(
  data: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role !== 'admin' && data.orgId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const resolvedOrgId =
    session.user.role === 'admin' ? session.user.id : data.orgId;

  const newEvent: NewEvent = {
    ...data,
    orgId: resolvedOrgId,
    id: Date.now().toString(),
  };

  await db.insert(events).values(newEvent);
  revalidatePath('/');
  revalidatePath('/dashboard');

  return newEvent;
}

export async function updateEvent(id: string, data: Partial<Event>) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Usuario es dueño del evento o es admin
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  if (!event) {
    throw new Error('Event not found');
  }

  if (session.user.role !== 'admin' && event.orgId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db
    .update(events)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id));

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/events/${id}`);
}

export async function deleteEvent(id: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Usuario es dueño del evento o es admin
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  if (!event) {
    throw new Error('Event not found');
  }

  if (session.user.role !== 'admin' && event.orgId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db.delete(events).where(eq(events.id, id));
  revalidatePath('/');
  revalidatePath('/dashboard');
}

export async function uploadBanner(formData: FormData): Promise<string> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    throw new Error('No file provided');
  }

  //comprimir y transformar a webp
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const bytes = await sharp(buffer)
    .resize({ width: 1200 })
    .webp({ quality: 80 })
    .toBuffer()
    .catch((err) => {
      console.error('Error al optimizar la imagen:', err);
      throw new Error('Failed to optimize image');
    });
  return saveImage(bytes, file.name);
}
