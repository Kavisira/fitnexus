import { prisma } from "@/lib/prisma";

export async function getUserPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return [];
  }

  return user.role.permissions.map(
    (rolePermission) => rolePermission.permission.permissionCode
  );
}

export async function hasPermission(userId: string, permissionCode: string) {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionCode);
}