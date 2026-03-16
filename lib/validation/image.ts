export const IMAGE_LIMITS = {
  allowedTypes: <readonly string[]>['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 5 * 1024 * 1024,
} as const;

export function validateImage(file: File): string | null {
  if (!IMAGE_LIMITS.allowedTypes.includes(file.type)) {
    return 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WEBP.';
  }

  if (file.size > IMAGE_LIMITS.maxSize) {
    return `La imagen es demasiado grande. El tamaño máximo es ${IMAGE_LIMITS.maxSize / (1024 * 1024)} MB.`;
  }

  return null;
}
