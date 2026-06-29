import { z } from "zod";

export const verifyForgotPasswordOtpSchema = z.object({
  resetSessionToken: z
    .string()
    .min(1, "Password reset session token is required"),

  otpCode: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export type VerifyForgotPasswordOtpInput = z.infer<
  typeof verifyForgotPasswordOtpSchema
>;