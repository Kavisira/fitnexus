import { OtpTargetType } from "@prisma/client";
import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";
import { verifyOtpSchema } from "@/features/auth/validations/verify-otp.schema";
import { verifyRegistrationOtp } from "@/lib/auth/otp.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = verifyOtpSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const result = await verifyRegistrationOtp({
    sessionToken: validation.data.sessionToken,
    targetType: validation.data.targetType as OtpTargetType,
    otpCode: validation.data.otpCode,
  });

  return successResponse(result, "OTP verified successfully");
});