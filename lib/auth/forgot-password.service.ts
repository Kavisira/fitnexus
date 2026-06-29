import crypto from "crypto";
import {
  OtpPurpose,
  OtpStatus,
  OtpTargetType,
  PasswordResetSessionStatus,
} from "@prisma/client";
import { AppError } from "@/lib/api/app-error";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendForgotPasswordOtp(input: { loginId: string }) {
  const loginId = input.loginId.trim().toLowerCase();
  const phone = loginId.replace(/\D/g, "");

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: loginId }, { phone }],
    },
  });

  if (!user) {
    throw new AppError("No account found with this email or mobile number", 404);
  }

  const targetType =
    user.email.toLowerCase() === loginId
      ? OtpTargetType.EMAIL
      : OtpTargetType.PHONE;

  const targetValue =
    targetType === OtpTargetType.EMAIL ? user.email : user.phone;

  await prisma.verificationOtp.updateMany({
    where: {
      targetType,
      targetValue,
      purpose: OtpPurpose.FORGOT_PASSWORD,
      status: OtpStatus.PENDING,
    },
    data: { status: OtpStatus.EXPIRED },
  });

  await prisma.passwordResetSession.updateMany({
    where: {
      userId: user.id,
      status: PasswordResetSessionStatus.PENDING,
    },
    data: { status: PasswordResetSessionStatus.EXPIRED },
  });

  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

  const sessionExpiresAt = new Date();
  sessionExpiresAt.setMinutes(sessionExpiresAt.getMinutes() + 30);

  const otpCode = generateOtp();
  const resetSessionToken = crypto.randomUUID();

  const result = await prisma.$transaction(async (tx) => {
    const otp = await tx.verificationOtp.create({
      data: {
        targetType,
        targetValue,
        otpCode,
        purpose: OtpPurpose.FORGOT_PASSWORD,
        expiresAt: otpExpiresAt,
      },
    });

    const session = await tx.passwordResetSession.create({
      data: {
        sessionToken: resetSessionToken,
        userId: user.id,
        otpId: otp.id,
        expiresAt: sessionExpiresAt,
      },
    });

    return { otp, session };
  });

  return {
    resetSessionToken: result.session.sessionToken,
    otpCode: result.otp.otpCode, // dev only
    targetType,
    expiresAt: result.otp.expiresAt,
  };
}

export async function verifyForgotPasswordOtp(input: {
  resetSessionToken: string;
  otpCode: string;
}) {
  const session = await prisma.passwordResetSession.findUnique({
    where: { sessionToken: input.resetSessionToken },
    include: { user: true },
  });

  if (!session) {
    throw new AppError("Invalid password reset session", 404);
  }

  if (session.status !== PasswordResetSessionStatus.PENDING) {
    throw new AppError("Password reset session is not active", 400);
  }

  if (session.expiresAt < new Date()) {
    await prisma.passwordResetSession.update({
      where: { id: session.id },
      data: { status: PasswordResetSessionStatus.EXPIRED },
    });

    throw new AppError("Password reset session has expired", 400);
  }

  if (!session.otpId) {
    throw new AppError("OTP has not been requested", 400);
  }

  const otp = await prisma.verificationOtp.findUnique({
    where: { id: session.otpId },
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
    prisma.passwordResetSession.update({
      where: { id: session.id },
      data: {
        verified: true,
        status: PasswordResetSessionStatus.VERIFIED,
      },
    }),
  ]);

  return {
    verified: true,
    resetSessionToken: session.sessionToken,
  };
}

export async function resetPasswordWithSession(input: {
  resetSessionToken: string;
  password: string;
}) {
  const session = await prisma.passwordResetSession.findUnique({
    where: { sessionToken: input.resetSessionToken },
    include: { user: true },
  });

  if (!session) {
    throw new AppError("Invalid password reset session", 404);
  }

  if (session.status !== PasswordResetSessionStatus.VERIFIED) {
    throw new AppError("OTP verification required", 400);
  }

  if (!session.verified) {
    throw new AppError("OTP verification required", 400);
  }

  if (session.expiresAt < new Date()) {
    await prisma.passwordResetSession.update({
      where: { id: session.id },
      data: { status: PasswordResetSessionStatus.EXPIRED },
    });

    throw new AppError("Password reset session has expired", 400);
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetSession.update({
      where: { id: session.id },
      data: {
        status: PasswordResetSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    }),
    prisma.userSession.updateMany({
      where: {
        userId: session.userId,
        status: "ACTIVE",
      },
      data: { status: "REVOKED" },
    }),
  ]);

  return {
    passwordReset: true,
  };
}