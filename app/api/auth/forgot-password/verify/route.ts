import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";
import { verifyForgotPasswordOtpSchema } from "@/features/auth/validations/verify-forgot-password-otp.schema";
import { verifyForgotPasswordOtp } from "@/lib/auth/forgot-password.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = verifyForgotPasswordOtpSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const result = await verifyForgotPasswordOtp(validation.data);

  return successResponse(result, "OTP verified successfully");
});