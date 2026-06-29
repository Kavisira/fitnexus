-- CreateEnum
CREATE TYPE "RegistrationSessionStatus" AS ENUM ('PENDING', 'VERIFIED', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "RegistrationSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "RegistrationSessionStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationSession_sessionToken_key" ON "RegistrationSession"("sessionToken");

-- CreateIndex
CREATE INDEX "RegistrationSession_email_idx" ON "RegistrationSession"("email");

-- CreateIndex
CREATE INDEX "RegistrationSession_phone_idx" ON "RegistrationSession"("phone");

-- CreateIndex
CREATE INDEX "RegistrationSession_sessionToken_idx" ON "RegistrationSession"("sessionToken");

-- CreateIndex
CREATE INDEX "RegistrationSession_status_idx" ON "RegistrationSession"("status");
