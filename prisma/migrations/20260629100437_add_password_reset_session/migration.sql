-- CreateEnum
CREATE TYPE "PasswordResetSessionStatus" AS ENUM ('PENDING', 'VERIFIED', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "PasswordResetSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "PasswordResetSessionStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetSession_sessionToken_key" ON "PasswordResetSession"("sessionToken");

-- CreateIndex
CREATE INDEX "PasswordResetSession_sessionToken_idx" ON "PasswordResetSession"("sessionToken");

-- CreateIndex
CREATE INDEX "PasswordResetSession_userId_idx" ON "PasswordResetSession"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetSession_status_idx" ON "PasswordResetSession"("status");

-- CreateIndex
CREATE INDEX "PasswordResetSession_expiresAt_idx" ON "PasswordResetSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "PasswordResetSession" ADD CONSTRAINT "PasswordResetSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
