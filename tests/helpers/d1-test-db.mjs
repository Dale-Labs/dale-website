import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const MIGRATION_URL = new URL("../../d1/migrations/0001_artifact_registry.sql", import.meta.url);
const SEED_URL = new URL("../../d1/seeds/artifact_registry_seed.sql", import.meta.url);

export function createSeededD1() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(fs.readFileSync(MIGRATION_URL, "utf8"));
  sqlite.exec(fs.readFileSync(SEED_URL, "utf8"));

  return {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        async all(...values) {
          return { results: statement.all(...values) };
        },
      };
    },
  };
}
