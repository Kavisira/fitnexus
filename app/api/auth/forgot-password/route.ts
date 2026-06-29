import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";
import { forgotPasswordSchema } from "@/features/auth/validations/forgot-password.schema";
import { sendForgotPasswordOtp } from "@/lib/auth/forgot-password.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = forgotPasswordSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const result = await sendForgotPasswordOtp(validation.data);

  return successResponse(result, "OTP sent successfully", 201);
});