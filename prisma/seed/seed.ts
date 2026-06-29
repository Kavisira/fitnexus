import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const permissions = [
  {
    permissionCode: "DASHBOARD_VIEW",
    module: "Dashboard",
    permissionName: "View Dashboard",
    description: "Allows user to view dashboard.",
  },
  {
    permissionCode: "ORGANIZATION_VIEW",
    module: "Organization",
    permissionName: "View Organization",
    description: "Allows user to view organization details.",
  },
  {
    permissionCode: "ORGANIZATION_UPDATE",
    module: "Organization",
    permissionName: "Update Organization",
    description: "Allows user to update organization details.",
  },
  {
    permissionCode: "BRANCH_VIEW",
    module: "Branch",
    permissionName: "View Branches",
    description: "Allows user to view branches.",
  },
  {
    permissionCode: "BRANCH_CREATE",
    module: "Branch",
    permissionName: "Create Branch",
    description: "Allows user to create branches.",
  },
  {
    permissionCode: "BRANCH_UPDATE",
    module: "Branch",
    permissionName: "Update Branch",
    description: "Allows user to update branches.",
  },
  {
    permissionCode: "USER_VIEW",
    module: "User",
    permissionName: "View Users",
    description: "Allows user to view users.",
  },
  {
    permissionCode: "USER_CREATE",
    module: "User",
    permissionName: "Create User",
    description: "Allows user to create users.",
  },
  {
    permissionCode: "USER_UPDATE",
    module: "User",
    permissionName: "Update User",
    description: "Allows user to update users.",
  },
  {
    permissionCode: "ROLE_VIEW",
    module: "Role",
    permissionName: "View Roles",
    description: "Allows user to view roles.",
  },
  {
    permissionCode: "ROLE_CREATE",
    module: "Role",
    permissionName: "Create Role",
    description: "Allows user to create roles.",
  },
  {
    permissionCode: "ROLE_UPDATE",
    module: "Role",
    permissionName: "Update Role",
    description: "Allows user to update roles.",
  },
  {
    permissionCode: "ROLE_ASSIGN_PERMISSION",
    module: "Role",
    permissionName: "Assign Permissions",
    description: "Allows user to assign permissions to roles.",
  },
];

const codeSequences = [
  { sequenceType: "ORGANIZATION", prefix: "ORG" },
  { sequenceType: "BRANCH", prefix: "BR" },
  { sequenceType: "USER", prefix: "USR" },
  { sequenceType: "MEMBER", prefix: "MEM" },
  { sequenceType: "LEAD", prefix: "LED" },
  { sequenceType: "MEMBERSHIP", prefix: "MSH" },
  { sequenceType: "PAYMENT", prefix: "PAY" },
  { sequenceType: "INVOICE", prefix: "INV" },
] as const;

async function main() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { permissionCode: permission.permissionCode },
      update: permission,
      create: permission,
    });
  }

  console.log("✅ Permissions seeded successfully");

  for (const sequence of codeSequences) {
  await prisma.codeSequence.upsert({
    where: { sequenceType: sequence.sequenceType },
    update: {
      prefix: sequence.prefix,
    },
    create: {
      sequenceType: sequence.sequenceType,
      prefix: sequence.prefix,
      lastNumber: 0,
      padding: 6,
    },
  });
}

console.log("✅ Code sequences seeded successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });