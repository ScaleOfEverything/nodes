import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { walk } from "./util.js";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import * as path from "path";
import { CACHE_ROOT, DIST_ROOT, ROOT } from "./paths.js";

/**
 * @param {string} root
 */
export async function hashDirectory(root) {
  const sha1 = createHash("sha1");

  for await (const file of walk(root, { directories: false })) {
    sha1.update(await readFile(file));
  }

  return sha1.digest("base64");
}

const cacheMetadata = new Map(
  Object.entries(
    existsSync(path.join(CACHE_ROOT, "metadata.json"))
      ? JSON.parse(readFileSync(path.join(CACHE_ROOT, "metadata.json"), "utf8"))
      : {}
  )
);

const version = await hashDirectory(path.join(ROOT, "build"));
if (cacheMetadata.get("version") !== version) {
  if (cacheMetadata.get("version")) {
    console.log(`build code was modified, throwing away cache`);
    rmSync(DIST_ROOT, { force: true, recursive: true });
    mkdirSync(DIST_ROOT);
    rmSync(CACHE_ROOT, { force: true, recursive: true });
    mkdirSync(CACHE_ROOT);
  }
  cacheMetadata.clear();
  cacheMetadata.set("version", version);
}

/**
 * Do an action but only if the `dependsOn` directory has changed from the last time this was called.
 *
 * @param {string} name
 * @param {string} dependsOn
 * @param {() => Promise<void>} action
 */
export async function doCachedAction(name, dependsOn, action) {
  const cacheKey = `${name}:${dependsOn}`;
  const currentHash = cacheMetadata.get(cacheKey);
  const newHash = await hashDirectory(dependsOn);

  if (currentHash !== newHash) {
    await action();
    cacheMetadata.set(cacheKey, newHash);
  }
}

process.on("exit", () => {
  writeFileSync(
    path.join(CACHE_ROOT, "metadata.json"),
    JSON.stringify(Object.fromEntries(cacheMetadata.entries()))
  );
});
