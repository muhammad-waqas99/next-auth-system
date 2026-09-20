import { z } from "zod";
import { ValidationError } from "@/app/lib/errors/ValidationError";

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }

  return result.data;
}