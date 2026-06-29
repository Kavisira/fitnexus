import { z } from "zod";

const targetTypeSchema = z.enum(["EMAIL", "PHONE"]);

const firstOtpRequestSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{7,15}$/, "Mobile number must contain between 7 and 15 digits"),
  targetType: targetTypeSchema,
});

const existingSessionOtpRequestSchema = z.object({
  sessionToken: z.string().min(1, "Registration session token is required"),
  targetType: targetTypeSchema,
});

export const sendOtpSchema = z.union([
  firstOtpRequestSchema,
  existingSessionOtpRequestSchema,
]);

export type SendOtpInput = z.infer<typeof sendOtpSchema>;