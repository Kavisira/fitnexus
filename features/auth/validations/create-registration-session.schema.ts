import { z } from "zod";

export const createRegistrationSessionSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{7,15}$/, "Mobile number must contain between 7 and 15 digits"),
});

export type CreateRegistrationSessionInput = z.infer<
  typeof createRegistrationSessionSchema
>;