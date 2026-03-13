import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { env } from './env';

export async function saveImage(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const uploadDir = env.UPLOAD_DIR;
  await mkdir(uploadDir, { recursive: true });

  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const parsedFileName = `${Date.now()}-${baseName}.webp`;
  const path = join(uploadDir, parsedFileName);

  await writeFile(path, buffer);
  return `/community-events/uploads/${parsedFileName}`;
}
