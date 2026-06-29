import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAccessToken } from "@/lib/auth/jwt";
import { setAccessTokenCookie } from "@/lib/auth/cookies";
import { UserStatus, SessionStatus } from "@prisma/client";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { clearAccessTokenCookie, getAccessTokenCookie } from "@/lib/auth/cookies";
import { hasPermission } from "@/lib/auth/permission";
import { AppError } from "@/lib/api/app-error";
type LoginInput = {
  loginId: string; // email or phone
  password: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export async function loginUser(input: LoginInput) {
 const loginId = input.loginId.trim().toLowerCase();
const phone = input.loginId.replace(/\D/g, "");

const user = await prisma.user.findFirst({
  where: {
    OR: [
      { email: loginId },
      { phone },
    ],
  },
  include: {
    role: true,
    organization: true,
    branches: {
      include: {
        branch: true,
      },
    },
  },
});

  if (!user) {
throw new AppError("Invalid login credentials", 401);  
}

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError("User account is not active", 403);
  }

  const isPasswordValid = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
throw new AppError("Invalid login credentials", 401);  
  }

  const primaryBranch =
    user.branches.find((item) => item.isPrimaryBranch) ?? user.branches[0];

  const sessionToken = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      sessionToken,
      userAgent: input.userAgent ?? undefined,
      ipAddress: input.ipAddress ?? undefined,
      expiresAt,
      status: SessionStatus.ACTIVE,
    },
  });

  const accessToken = await createAccessToken({
    sessionId: session.id,
    userId: user.id,
    organizationId: user.organizationId ?? "",
  });

  await setAccessTokenCookie(accessToken);

  return {
    user: {
      id: user.id,
      userCode: user.userCode,
      ownerName: user.ownerName,
      email: user.email,
      phone: user.phone,
      organizationId: user.organizationId,
      organizationName: user.organization?.displayName,
      roleId: user.roleId,
      roleType: user.role.roleType,
      roleName: user.role.roleName,
      primaryBranchId: primaryBranch?.branchId ?? null,
      primaryBranchName: primaryBranch?.branch.branchName ?? null,
    },
  };
}
export async function logoutUser() {
  const token = await getAccessTokenCookie();

  if (!token) {
    await clearAccessTokenCookie();

    return {
      loggedOut: false,
      reason: "No active session found",
    };
  }

  try {
    const payload = await verifyAccessToken(token);

    const session = await prisma.userSession.update({
      where: {
        id: payload.sessionId,
      },
      data: {
        status: SessionStatus.LOGGED_OUT,
        lastActivityAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    await clearAccessTokenCookie();

    return {
      loggedOut: true,
      sessionId: session.id,
      userId: session.userId,
      userName: session.user.ownerName,
      email: session.user.email,
    };
  } catch {
    await clearAccessTokenCookie();

    return {
      loggedOut: false,
      reason: "Invalid or expired session",
    };
  }
}
export async function getCurrentUser() {
  const token = await getAccessTokenCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);

    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        status: SessionStatus.ACTIVE,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            organization: true,
            role: true,
            branches: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    const primaryBranch =
      session.user.branches.find((item) => item.isPrimaryBranch) ??
      session.user.branches[0];

    return {
      sessionId: session.id,
      userId: session.user.id,
      userCode: session.user.userCode,
      ownerName: session.user.ownerName,
      email: session.user.email,
      phone: session.user.phone,
      organizationId: session.user.organizationId,
      organizationName: session.user.organization?.displayName,
      roleId: session.user.roleId,
      roleType: session.user.role.roleType,
      roleName: session.user.role.roleName,
      primaryBranchId: primaryBranch?.branchId ?? null,
      primaryBranchName: primaryBranch?.branch.branchName ?? null,
    };
  } catch {
    return null;
  }
}
export async function requireCurrentUserPermission(permissionCode: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const allowed = await hasPermission(user.userId, permissionCode);

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return user;
}