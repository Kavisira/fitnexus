const fs = require("fs");
const path = require("path");

const prismaDir = path.join(process.cwd(), "prisma");

const outputFile = path.join(prismaDir, "schema.prisma");

const files = [
  "base.prisma",
  "enums/record-status.prisma",
  "enums/role-type.prisma",
  "enums/theme-type.prisma",
  "enums/language-type.prisma",
  "enums/time-format.prisma",
  "enums/user-status.prisma",
  "enums/sequence-type.prisma",
  "enums/session-status.prisma",
  "enums/registration-session-status.prisma",
  "enums/otp-target-type.prisma",
  "enums/otp-purpose.prisma",
  "enums/otp-status.prisma",
"enums/password-reset-session-status.prisma",
"enums/otp-target-type.prisma",
"enums/otp-purpose.prisma",
"enums/otp-status.prisma",

  "models/organization.prisma",
  "models/branch.prisma",
  "models/organization-settings.prisma",
  "models/role.prisma",
  "models/permission.prisma",
  "models/role-permission.prisma",
  "models/user.prisma",
  "models/user-branch.prisma",
  "models/user-session.prisma",
  "models/code-sequence.prisma",
  "models/verification-otp.prisma",
  "models/registration-session.prisma",
  "models/password-reset-session.prisma",
"models/verification-otp.prisma",
];

const content = files
  .map((file) => {
    const filePath = path.join(prismaDir, file);
    return fs.readFileSync(filePath, "utf8");
  })
  .join("\n\n");

fs.writeFileSync(outputFile, content);

console.log("✅ Prisma schema merged successfully");