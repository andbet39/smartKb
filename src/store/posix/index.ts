import type { KbStore } from "../interfaces.ts";
import { PosixStore } from "./store.ts";
import type { PosixStoreOptions } from "./types.ts";

export type { PosixSemanticOptions, PosixStoreOptions } from "./types.ts";

/** Opens (or creates) a filesystem KB in `options.root`. */
export function createPosixStore(options: PosixStoreOptions): Promise<KbStore> {
  return PosixStore.open(options);
}
