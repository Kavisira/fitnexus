import { z } from "zod";

export const forgotPasswordSchema = z.object({
  loginId: z.string().min(1, "Email or mobile number is required"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;