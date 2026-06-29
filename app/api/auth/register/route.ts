import {
  RegistrationSessionStatus,
  RoleType,
  SequenceType,
} from "@prisma/client";
import { registerSchema } from "@/features/auth/validations/register.schema";
import { apiHandler } from "@/lib/api/handler";
import { AppError } from "@/lib/api/app-error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { generateNextCode } from "@/lib/services/code-sequence.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = registerSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const {
    sessionToken,
    ownerName,
    organizationName,
    mainBranchName,
    password,
  } = validation.data;

  const session = await prisma.registrationSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    throw new AppError("Invalid registration session", 404);
  }

  if (session.status !== RegistrationSessionStatus.PENDING) {
    throw new AppError("Registration session is not active", 400);
  }

  if (session.expiresAt < new Date()) {
    await prisma.registrationSession.update({
      where: { id: session.id },
      data: { status: RegistrationSessionStatus.EXPIRED },
    });

    throw new AppError("Registration session has expired", 400);
  }

  if (!session.emailVerified || !session.phoneVerified) {
    throw new AppError("Email and mobile verification required", 400);
  }

  const email = session.email;
  const phone = session.phone;

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const organizationCode = await generateNextCode(
      tx,
      SequenceType.ORGANIZATION
    );
    const branchCode = await generateNextCode(tx, SequenceType.BRANCH);
    const userCode = await generateNextCode(tx, SequenceType.USER);

    const organization = await tx.organization.create({
      data: {
        organizationCode,
        organizationName,
        displayName: organizationName,
        email,
        phone,
      },
    });

    const branch = await tx.branch.create({
      data: {
        branchCode,
        organizationId: organization.id,
        branchName: mainBranchName,
        displayName: mainBranchName,
        isHeadOffice: true,
      },
    });

    const role = await tx.role.create({
      data: {
        organizationId: organization.id,
        roleType: RoleType.ORG_ADMIN,
        roleName: "Organization Admin",
        description: "Default admin role created during registration",
        isDefault: true,
      },
    });

    const permissions = await tx.permission.findMany({
      where: { status: "ACTIVE" },
    });

    if (permissions.length > 0) {
      await tx.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }

    const user = await tx.user.create({
      data: {
        userCode,
        organizationId: organization.id,
        roleId: role.id,
        ownerName,
        email,
        phone,
        passwordHash,
        status: "ACTIVE",
      },
    });

    await tx.organizationSettings.create({
      data: { organizationId: organization.id },
    });

    await tx.userBranch.create({
      data: {
        userId: user.id,
        branchId: branch.id,
        isPrimaryBranch: true,
      },
    });

    await tx.registrationSession.update({
      where: { id: session.id },
      data: {
        status: RegistrationSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return {
      organizationId: organization.id,
      organizationCode: organization.organizationCode,
      branchId: branch.id,
      branchCode: branch.branchCode,
      userId: user.id,
      userCode: user.userCode,
    };
  });

  return successResponse(result, "Registration completed successfully", 201);
});