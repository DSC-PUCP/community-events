'use server';

import {categories, Category, db, NewCategory} from '@/lib/db';
import {eq} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';

async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
}

export async function createCategory(name: string) {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const newCategory: NewCategory = {
        name,
    };

    await db.insert(categories).values(newCategory);
    revalidatePath('/');
    revalidatePath('/dashboard');

    return newCategory;
}

export async function deleteCategory(id: number) {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/');
    revalidatePath('/dashboard');
}