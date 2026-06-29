import crypto from "crypto";
import { RegistrationSessionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/app-error";

export async function createRegistrationSession(input: {
  email: string;
  phone: string;
}) {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.replace(/\D/g, "");

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw new AppError("Email or mobile number already registered", 409);
  }

  const existingOrganization = await prisma.organization.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingOrganization) {
    throw new AppError("Organization email or phone already registered", 409);
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  const sessionToken = crypto.randomUUID();

  const session = await prisma.registrationSession.create({
    data: {
      sessionToken,
      email,
      phone,
      expiresAt,
      status: RegistrationSessionStatus.PENDING,
    },
  });

  return {
    sessionToken: session.sessionToken,
    email: session.email,
    phone: session.phone,
    expiresAt: session.expiresAt,
  };
}