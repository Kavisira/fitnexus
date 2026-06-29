import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const registerSchema = z
  .object({
    sessionToken: z.string().min(1, "Registration session token is required"),

    ownerName: z
      .string()
      .trim()
      .min(3, "Owner name must be at least 3 characters"),

    organizationName: z
      .string()
      .trim()
      .min(3, "Organization name must be at least 3 characters"),

    mainBranchName: z
      .string()
      .trim()
      .min(3, "Main branch name must be at least 3 characters"),

    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      ),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;