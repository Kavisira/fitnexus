import { OtpTargetType } from "@prisma/client";
import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";
import { sendOtpSchema } from "@/features/auth/validations/send-otp.schema";
import { sendRegistrationOtp } from "@/lib/auth/otp.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = sendOtpSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const data = validation.data;

  const result =
    "sessionToken" in data
      ? await sendRegistrationOtp({
          sessionToken: data.sessionToken,
          targetType: data.targetType as OtpTargetType,
        })
      : await sendRegistrationOtp({
          email: data.email,
          phone: data.phone,
          targetType: data.targetType as OtpTargetType,
        });

  return successResponse(result, "OTP sent successfully", 201);
});