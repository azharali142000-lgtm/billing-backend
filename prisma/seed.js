require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN }
  });

  if (existingAdmin) {
    console.log("Admin user already exists. Skipping seed.");
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));

  await prisma.user.create({
    data: {
      name: "System Admin",
      phone: process.env.SEED_ADMIN_PHONE || "9999999999",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  console.log("Seeded admin user.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
