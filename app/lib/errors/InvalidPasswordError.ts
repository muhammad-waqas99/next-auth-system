import { AppError } from "./AppError";
import { ERROR_MESSAGES } from "./messages";

export class InvalidPasswordError extends AppError {
  constructor() {
    super(
      "INVALID_PASSWORD",
      ERROR_MESSAGES.INVALID_PASSWORD,
      400
    );
  }
}