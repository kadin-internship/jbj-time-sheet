import bcrypt from "bcryptjs";
import { db } from "../lib/db/client";
import { users, projects } from "../lib/db/schema";

const DEFAULT_PROJECTS = [
  "ATP/AECOM",
  "DISD/AECOM",
  "DISD/PCI",
  "Bergstrom/STV",
  "DART/NTx",
  "DFW/Vivid Govtek",
  "City of Austin/SIP",
  "DFW/AAAJV",
  "Dallas County/Oracle",
  "Benevolence",
  "Administration",
  "Holiday",
  "PTO",
  "Sick Time",
];

async function main() {
  const adminPassword = "ChangeMe123!";
  const employeePassword = "ChangeMe123!";

  const [admin] = await db
    .insert(users)
    .values({
      username: "admin",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      fullName: "Admin User",
      role: "admin",
    })
    .onConflictDoNothing({ target: users.username })
    .returning();

  const [employee] = await db
    .insert(users)
    .values({
      username: "employee",
      passwordHash: await bcrypt.hash(employeePassword, 12),
      fullName: "Sample Employee",
      role: "employee",
    })
    .onConflictDoNothing({ target: users.username })
    .returning();

  await db
    .insert(projects)
    .values(DEFAULT_PROJECTS.map((name, i) => ({ name, sortOrder: i + 1 })))
    .onConflictDoNothing();

  console.log("Seed complete.");
  if (admin) console.log(`Admin login    -> username: admin    password: ${adminPassword}`);
  else console.log("Admin user already existed, left unchanged.");
  if (employee) console.log(`Employee login -> username: employee password: ${employeePassword}`);
  else console.log("Employee user already existed, left unchanged.");
  console.log("Change these passwords after first login.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
