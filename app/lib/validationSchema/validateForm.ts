import { z } from "zod";

export function validateForm<T extends z.ZodType>(
  schema: T,
  data: unknown
):
  | {
      success: true;
      data: z.infer<T>;
    }
  | {
      success: false;
      errors: Record<string, string>;
    } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;

      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}