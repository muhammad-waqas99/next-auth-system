import { AppError } from "./AppError";

export function errorHandler(error: unknown) {

  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  return Response.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong.",
    },
    {
      status: 500,
    }
  );
}