import { Prisma, SequenceType } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export async function generateNextCode(
  tx: TransactionClient,
  sequenceType: SequenceType
) {
  const sequence = await tx.codeSequence.findUnique({
    where: { sequenceType },
  });

  if (!sequence) {
    throw new Error(`Code sequence not configured for ${sequenceType}`);
  }

  const nextNumber = sequence.lastNumber + 1;

  await tx.codeSequence.update({
    where: { sequenceType },
    data: {
      lastNumber: nextNumber,
    },
  });

  const paddedNumber = String(nextNumber).padStart(sequence.padding, "0");

  return `${sequence.prefix}-${paddedNumber}`;
}