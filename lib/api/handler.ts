import { AppError } from "@/lib/api/app-error";
import { errorResponse } from "@/lib/api/response";

type ApiRouteHandler = (request: Request) => Promise<Response>;

export function apiHandler(handler: ApiRouteHandler) {
  return async function wrappedHandler(request: Request) {
    try {
      return await handler(request);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode, error.errors);
      }

      return errorResponse("Something went wrong", 500);
    }
  };
}