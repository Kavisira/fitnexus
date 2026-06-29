-- CreateEnum
CREATE TYPE "OtpTargetType" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'FORGOT_PASSWORD');

-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED');

-- CreateTable
CREATE TABLE "VerificationOtp" (
    "id" TEXT NOT NULL,
    "targetType" "OtpTargetType" NOT NULL,
    "targetValue" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "status" "OtpStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationOtp_targetType_targetValue_idx" ON "VerificationOtp"("targetType", "targetValue");

-- CreateIndex
CREATE INDEX "VerificationOtp_purpose_idx" ON "VerificationOtp"("purpose");

-- CreateIndex
CREATE INDEX "VerificationOtp_status_idx" ON "VerificationOtp"("status");

-- CreateIndex
CREATE INDEX "VerificationOtp_expiresAt_idx" ON "VerificationOtp"("expiresAt");
