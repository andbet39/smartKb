import { randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { errorCode } from "./files.ts";
import type { PosixStoreSettings } from "./types.ts";

const SETTINGS_FILE = "store.json";

/** Reads `.kb/store.json`; an absent file means no settings yet. */
export async function readSettings(kbFolder: string): Promise<PosixStoreSettings> {
  try {
    return JSON.parse(await readFile(join(kbFolder, SETTINGS_FILE), "utf8")) as PosixStoreSettings;
  } catch (cause) {
    if (errorCode(cause) === "ENOENT") return {};
    throw cause;
  }
}

export async function writeSettings(kbFolder: string, settings: PosixStoreSettings): Promise<void> {
  const path = join(kbFolder, SETTINGS_FILE);
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(settings, null, 2), { encoding: "utf8", flag: "wx" });
    // Readers on independent connections must never see partially written JSON.
    await rename(temporary, path);
  } catch (cause) {
    await rm(temporary, { force: true }).catch(() => {});
    throw cause;
  }
}
