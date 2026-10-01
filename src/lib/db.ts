import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ProjectDocument } from "@/lib/schema";

export interface AssetRecord {
  id: string;
  blob: Blob;
  mime: string;
}

interface ConversationDb extends DBSchema {
  project: {
    key: string;
    value: ProjectDocument;
  };
  assets: {
    key: string;
    value: AssetRecord;
  };
}

const DB_NAME = "conversation-mockup";
const DB_VERSION = 1;
export const PROJECT_KEY = "current";

let databasePromise: Promise<IDBPDatabase<ConversationDb>> | null = null;

export function getDb() {
  if (!databasePromise) {
    databasePromise = openDB<ConversationDb>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains("project")) {
          database.createObjectStore("project");
        }
        if (!database.objectStoreNames.contains("assets")) {
          database.createObjectStore("assets");
        }
      },
    });
  }
  return databasePromise;
}
