import { AppError } from "./AppError";
import { ERROR_MESSAGES } from "./messages";

export class UnauthorizedError extends AppError {
  constructor() {
    super(
      "UNAUTHORIZED",
      ERROR_MESSAGES.UNAUTHORIZED,
      401
    );
  }
}