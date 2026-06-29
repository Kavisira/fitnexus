import { z } from "zod";

export const verifyOtpSchema = z.object({
  sessionToken: z.string().min(1, "Registration session token is required"),
  targetType: z.enum(["EMAIL", "PHONE"]),
  otpCode: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;