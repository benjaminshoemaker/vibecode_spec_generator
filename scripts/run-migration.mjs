import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error("Usage: node scripts/run-migration.mjs <migration-file>");
    console.error("Example: node scripts/run-migration.mjs migrations/004_chat_logs.sql");
    process.exit(1);
  }

  const migrationPath = join(__dirname, "..", migrationFile);
  const migrationSql = readFileSync(migrationPath, "utf-8");

  // Remove comment lines and split by semicolons
  const cleanedSql = migrationSql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleanedSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running migration: ${migrationFile}`);
  console.log(`Found ${statements.length} statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50).replace(/\n/g, " ")}...`);
      await sql.query(statement);
      console.log("✓ Success\n");
    } catch (error) {
      console.error(`✗ Failed: ${error.message}\n`);
      // Continue with other statements (some may already exist)
    }
  }

  console.log("Migration complete!");
}

runMigration().catch(console.error);
