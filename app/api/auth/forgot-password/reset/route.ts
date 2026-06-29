import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";
import { resetPasswordSchema } from "@/features/auth/validations/reset-password.schema";
import { resetPasswordWithSession } from "@/lib/auth/forgot-password.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = resetPasswordSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const result = await resetPasswordWithSession({
    resetSessionToken: validation.data.resetSessionToken,
    password: validation.data.password,
  });

  return successResponse(result, "Password reset successfully");
});