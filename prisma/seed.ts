import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSION_CATALOG } from "@fieldpulse/shared-types";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "demo-construction" },
    update: {},
    create: { name: "Demo Construction Co", slug: "demo-construction" },
  });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@fieldpulse.dev" },
    update: {},
    create: {
      organizationId: org.id,
      firstName: "Admin",
      lastName: "User",
      email: "admin@fieldpulse.dev",
      passwordHash,
      status: "ACTIVE",
    },
  });

  const permissions = await Promise.all(
    PERMISSION_CATALOG.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: { description: permission.description },
        create: permission,
      }),
    ),
  );

  const ownerRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Owner" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Owner",
      description: "Full access to all organization resources.",
    },
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({ roleId: ownerRole.id, permissionId: permission.id })),
    skipDuplicates: true,
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: ownerRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: ownerRole.id },
  });

  console.log("Seed complete. Login with admin@fieldpulse.dev / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
