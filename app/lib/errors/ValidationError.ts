import { AppError } from "./AppError";
import { ERROR_MESSAGES } from "./messages";

export class ValidationError extends AppError {
  constructor(message?: string) {
    super(
      "VALIDATION_ERROR",
      message || ERROR_MESSAGES.VALIDATION_ERROR,
      400
    );
  }
}