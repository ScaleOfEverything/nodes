import { readdir, stat } from "fs/promises";
import * as path from "path";
import {
  defaultProcessLangMarkdown,
  defaultTransformNode,
} from "./default-category.js";

/**
 * Defines a node category.
 * @param {import("./types").NodeCategory} metadata
 */
export function createCategory(metadata) {
  metadata.transformNode ??= defaultTransformNode;
  metadata.processLangMarkdown ??= defaultProcessLangMarkdown;
  return metadata;
}

/**
 * Returns an async iterator over all files in a folder.
 * @param {string} root
 * @param {{ directories?: boolean, files?: boolean } | undefined} opts
 * @returns {AsyncIterable<string>}
 */
export async function* walk(root, opts = {}) {
  root = path.resolve(root);
  const { directories = true, files = true } = opts;

  for (const file of await readdir(root)) {
    const filepath = path.join(root, file);
    const isDirectory = await stat(filepath).then((stat) => stat.isDirectory());
    if ((isDirectory && directories) || (!isDirectory && files)) {
      yield filepath;
    }
    if (isDirectory) {
      yield* walk(filepath, opts);
    }
  }
}

export async function asyncMap2(array, fn) {
  for (const item of array) {
    await fn(item);
  }
}
