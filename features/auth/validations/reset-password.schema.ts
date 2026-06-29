import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const resetPasswordSchema = z
  .object({
    resetSessionToken: z
      .string()
      .min(1, "Password reset session token is required"),

    password: z.string().regex(
      passwordRegex,
      "Password must contain uppercase, lowercase, number and special character"
    ),

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;