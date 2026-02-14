import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { env } from './env';

export async function saveImage(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = env.UPLOAD_DIR;
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const path = join(uploadDir, fileName);

    await writeFile(path, buffer);
    return `/community-events/uploads/${fileName}`;
}