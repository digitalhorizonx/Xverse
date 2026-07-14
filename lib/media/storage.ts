import fs from "node:fs";
import path from "node:path";
import { databasePath } from "@/db";

/**
 * Storage abstraction for media binaries. One local-filesystem
 * implementation today (files beside the SQLite database on the
 * xverse-data volume); an S3/R2 adapter is the documented upgrade path —
 * consumers only ever see this interface.
 */
export interface StorageAdapter {
  write(fileName: string, data: Buffer): Promise<void>;
  read(fileName: string): Promise<Buffer>;
  delete(fileName: string): Promise<void>;
  exists(fileName: string): Promise<boolean>;
}

function mediaRoot(): string {
  // MEDIA_PATH override for tests; defaults to a sibling of the DB file so
  // both live on the same persistent volume.
  return process.env.MEDIA_PATH ?? path.join(path.dirname(databasePath()), "media");
}

/** Defense in depth: only hash-derived names we generated are ever valid. */
function safePath(fileName: string): string {
  if (!/^[a-z0-9]+(?:-thumb)?\.[a-z0-9]+$/.test(fileName)) {
    throw new Error(`Illegal media file name: ${fileName}`);
  }
  return path.join(mediaRoot(), fileName);
}

class LocalStorageAdapter implements StorageAdapter {
  async write(fileName: string, data: Buffer): Promise<void> {
    fs.mkdirSync(mediaRoot(), { recursive: true });
    await fs.promises.writeFile(safePath(fileName), data);
  }

  async read(fileName: string): Promise<Buffer> {
    return fs.promises.readFile(safePath(fileName));
  }

  async delete(fileName: string): Promise<void> {
    await fs.promises.rm(safePath(fileName), { force: true });
  }

  async exists(fileName: string): Promise<boolean> {
    return fs.promises
      .access(safePath(fileName))
      .then(() => true)
      .catch(() => false);
  }
}

let adapter: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!adapter) adapter = new LocalStorageAdapter();
  return adapter;
}
