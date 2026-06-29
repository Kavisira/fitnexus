-- CreateEnum
CREATE TYPE "SequenceType" AS ENUM ('ORGANIZATION', 'BRANCH', 'USER', 'MEMBER', 'LEAD', 'MEMBERSHIP', 'PAYMENT', 'INVOICE');

-- CreateTable
CREATE TABLE "CodeSequence" (
    "id" TEXT NOT NULL,
    "sequenceType" "SequenceType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "padding" INTEGER NOT NULL DEFAULT 6,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CodeSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeSequence_sequenceType_key" ON "CodeSequence"("sequenceType");

-- CreateIndex
CREATE INDEX "CodeSequence_sequenceType_idx" ON "CodeSequence"("sequenceType");
