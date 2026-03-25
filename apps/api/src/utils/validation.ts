import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../middleware/errors';

/**
 * Validate data against a Zod schema
 * Throws ValidationError if validation fails
 * Returns the parsed output type (with defaults applied)
 */
export function validate<T extends ZodSchema>(schema: T, data: unknown): z.output<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Validation failed', details);
    }
    throw error;
  }
}

/**
 * Validate data against a Zod schema and return result
 * Returns { success: true, data } if valid
 * Returns { success: false, error } if invalid
 */
export function validateSafe<T>(schema: ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; error: ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
