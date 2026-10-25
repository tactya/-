import Dexie, { type Table } from "dexie";
import type { Work, Runtime } from "./schema";
class Database extends Dexie {
  works!: Table<Work, string>;
  saves!: Table<{ id: string; state: Runtime }, string>;
  constructor() {
    super("foundphone-studio");
    this.version(1).stores({ works: "id,updatedAt", saves: "id" });
  }
}
export const db = new Database();
