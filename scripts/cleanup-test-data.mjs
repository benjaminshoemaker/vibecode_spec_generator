import { sql } from "@vercel/postgres";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function cleanupTestData() {
  const filePath = join(__dirname, "..", "excluded-client-ids.txt");

  if (!existsSync(filePath)) {
    console.log("No excluded-client-ids.txt file found, skipping cleanup");
    return;
  }

  const content = readFileSync(filePath, "utf-8");

  const clientIds = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (clientIds.length === 0) {
    console.log("No client IDs to clean up");
    return;
  }

  console.log(`Found ${clientIds.length} client ID(s) to clean up`);

  const tables = ["user_events", "chat_logs", "spec_metadata", "subscribers"];

  for (const table of tables) {
    try {
      const result = await sql.query(
        `DELETE FROM ${table} WHERE client_id = ANY($1::text[])`,
        [clientIds]
      );
      console.log(`✓ ${table}: deleted ${result.rowCount} rows`);
    } catch (error) {
      console.error(`✗ ${table}: ${error.message}`);
    }
  }

  console.log("Cleanup complete!");
}

cleanupTestData().catch(console.error);
