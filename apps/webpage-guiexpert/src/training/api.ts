import index from "./api-index.json";
import { CHAPTERS } from "./chapters";

export interface ApiEntry {
  url: string;
  kind: string;
}

const entries = index as Record<string, ApiEntry>;

/** Looks up an API symbol ("TableApi", "TableApi.sortByColumn"). Throws for unknown names → the build fails. */
export function apiEntry(name: string): ApiEntry {
  const entry = entries[name];
  if (!entry) {
    throw new Error(`Training: unknown API symbol "${name}". ` +
      "Fix the name or regenerate src/training/api-index.json (node scripts/build-api-index.mjs).");
  }
  return entry;
}

// every chapter's API list is checked once when this module is loaded
for (const chapter of CHAPTERS) chapter.api.forEach(apiEntry);
