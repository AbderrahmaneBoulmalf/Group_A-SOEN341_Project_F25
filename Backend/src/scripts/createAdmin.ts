import bcrypt from "bcrypt";
import db from "../db.js";

// Simple script to create an admin user directly in the Users table.
// Usage (from Backend folder):
//   npx tsx src/scripts/createAdmin.ts --email=admin@example.com --username=admin --password=Secret123

const saltRounds = 10;

function parseArg(name: string) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function main() {
  const email = parseArg("email");
  const username = parseArg("username") || "admin";
  let password = parseArg("password");

  if (!email) {
    console.error("Missing --email argument (e.g. --email=admin@example.com)");
    process.exit(1);
  }

  if (!password) {
    // If no password supplied, generate a random one and print it
    password = Math.random().toString(36).slice(-10) + "A1!";
    console.warn("No password supplied. Generated password:", password);
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const user = {
      Username: username,
      Email: email,
      Hash: hash,
      Role: "admin",
      Status: 1, // active
    } as any;

    const sql = "INSERT INTO Users SET ?";
    const [result] = await db.promise().query(sql, user);

    console.log("Admin user created successfully. InsertResult:", (result as any).insertId);
    console.log("Email:", email);
    console.log("Username:", username);
    console.log("Password (plaintext shown only once):", password);
  } catch (err: any) {
    console.error("Failed to create admin user:", err.message || err);
    process.exit(1);
  } finally {
    // Graceful shutdown of the pool
    try {
      (db as any).end?.();
    } catch {}
  }
}

main();
