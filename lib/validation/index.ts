import type { output, z } from 'zod';

type FieldErrors<Data> = Data extends object
  ? Partial<Record<keyof Data & string, string>>
  : Record<string, string>;

type ValidationResult<Data> =
  | { success: true; data: Data }
  | {
      success: false;
      fieldErrors: FieldErrors<Data>;
      formError: string;
    };

function mapZodFieldErrors(error: z.ZodError): Record<string, string> {
  const mappedErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const fieldPath = issue.path[0];
    if (typeof fieldPath !== 'string') {
      continue;
    }

    if (!mappedErrors[fieldPath]) {
      mappedErrors[fieldPath] = issue.message;
    }
  }

  return mappedErrors;
}

export function parseWithSchema<const Schema extends z.ZodSchema>(
  schema: Schema,
  input: unknown,
): ValidationResult<z.output<Schema>> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors = mapZodFieldErrors(parsed.error) as FieldErrors<
    output<Schema>
  >;
  const formError = parsed.error.issues[0]?.message ?? 'Datos inválidos.';

  return {
    success: false,
    fieldErrors,
    formError,
  };
}
