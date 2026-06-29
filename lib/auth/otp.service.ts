import { OtpPurpose, OtpStatus, OtpTargetType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "../api/app-error";
import { createRegistrationSession } from "@/lib/auth/registration-session.service";
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendRegistrationOtp(input: {
  sessionToken?: string;
  email?: string;
  phone?: string;
  targetType: OtpTargetType;
}) {
  let session = input.sessionToken
    ? await prisma.registrationSession.findUnique({
        where: { sessionToken: input.sessionToken },
      })
    : null;

  if (!session) {
    if (!input.email || !input.phone) {
      throw new AppError("Email and mobile number are required", 400);
    }

    session = await createRegistrationSession({
      email: input.email,
      phone: input.phone,
    });
  }

  const fullSession = await prisma.registrationSession.findUnique({
    where: { sessionToken: session.sessionToken },
  });

  if (!fullSession) {
    throw new AppError("Invalid registration session", 404);
  }

  if (fullSession.status !== "PENDING") {
    throw new AppError("Registration session is not active", 400);
  }

  if (fullSession.expiresAt < new Date()) {
    await prisma.registrationSession.update({
      where: { id: fullSession.id },
      data: { status: "EXPIRED" },
    });

    throw new AppError("Registration session has expired", 400);
  }

  const targetValue =
    input.targetType === OtpTargetType.EMAIL
      ? fullSession.email
      : fullSession.phone;

  const otpCode = generateOtp();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  await prisma.verificationOtp.updateMany({
    where: {
      targetType: input.targetType,
      targetValue,
      purpose: OtpPurpose.REGISTRATION,
      status: OtpStatus.PENDING,
    },
    data: { status: OtpStatus.EXPIRED },
  });

  const otp = await prisma.verificationOtp.create({
    data: {
      targetType: input.targetType,
      targetValue,
      otpCode,
      purpose: OtpPurpose.REGISTRATION,
      expiresAt,
    },
  });

  await prisma.registrationSession.update({
    where: { id: fullSession.id },
    data:
      input.targetType === OtpTargetType.EMAIL
        ? { emailOtpId: otp.id, emailVerified: false }
        : { phoneOtpId: otp.id, phoneVerified: false },
  });

  return {
    sessionToken: fullSession.sessionToken,
    otpCode, // dev only
    targetType: input.targetType,
    expiresAt: otp.expiresAt,
  };
}   
export async function verifyRegistrationOtp(input: {
  sessionToken: string;
  targetType: OtpTargetType;
  otpCode: string;
}) {
  const session = await prisma.registrationSession.findUnique({
    where: {
      sessionToken: input.sessionToken,
    },
  });

  if (!session) {
    throw new AppError("Invalid registration session", 404);
  }

  if (session.status !== "PENDING") {
    throw new AppError("Registration session is not active", 400);
  }

  if (session.expiresAt < new Date()) {
    await prisma.registrationSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });

    throw new AppError("Registration session has expired", 400);
  }

  const otpId =
    input.targetType === OtpTargetType.EMAIL
      ? session.emailOtpId
      : session.phoneOtpId;

  if (!otpId) {
    throw new AppError("OTP has not been requested", 400);
  }

  const otp = await prisma.verificationOtp.findUnique({
    where: {
      id: otpId,
    },
  });

  if (!otp) {
    throw new AppError("Invalid OTP request", 404);
  }

  if (otp.status !== OtpStatus.PENDING) {
    throw new AppError("OTP already used or expired", 400);
  }

  if (otp.expiresAt < new Date()) {
    await prisma.verificationOtp.update({
      where: { id: otp.id },
      data: { status: OtpStatus.EXPIRED },
    });

    throw new AppError("OTP has expired", 400);
  }

  if (otp.otpCode !== input.otpCode) {
    throw new AppError("Invalid OTP", 400);
  }

  await prisma.$transaction([
    prisma.verificationOtp.update({
      where: { id: otp.id },
      data: {
        status: OtpStatus.VERIFIED,
        verifiedAt: new Date(),
      },
    }),

    prisma.registrationSession.update({
      where: { id: session.id },
      data:
        input.targetType === OtpTargetType.EMAIL
          ? { emailVerified: true }
          : { phoneVerified: true },
    }),
  ]);

  const updatedSession = await prisma.registrationSession.findUnique({
    where: { id: session.id },
  });

  return {
    verified: true,
    targetType: input.targetType,
    emailVerified: updatedSession?.emailVerified ?? false,
    phoneVerified: updatedSession?.phoneVerified ?? false,
    registrationReady:
      Boolean(updatedSession?.emailVerified) &&
      Boolean(updatedSession?.phoneVerified),
  };
}