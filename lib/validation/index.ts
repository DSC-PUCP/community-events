import type { output, z } from 'zod';

type ValidationResult<Data> =
  | { success: true; data: Data }
  | {
      success: false;
      fieldErrors: Partial<Record<keyof Data, string>>;
      formError: string;
    };

function mapZodFieldErrors<Field extends string | number | symbol>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const mappedErrors: Partial<Record<Field, string>> = {};

  for (const issue of error.issues) {
    const fieldPath = issue.path[0];
    if (typeof fieldPath !== 'string') {
      continue;
    }

    const key = fieldPath as Field;
    if (!mappedErrors[key]) {
      mappedErrors[key] = issue.message;
    }
  }

  return mappedErrors;
}

export function parseWithSchema<const Schema extends z.ZodObject>(
  schema: Schema,
  input: unknown,
): ValidationResult<z.output<Schema>> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors = mapZodFieldErrors<keyof output<Schema>>(parsed.error);
  const formError = parsed.error.issues[0]?.message ?? 'Datos inválidos.';

  return {
    success: false,
    fieldErrors,
    formError,
  };
}
