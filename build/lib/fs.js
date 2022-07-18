import { readFileSync, writeFileSync } from "fs";
import { access, mkdir, readFile, writeFile } from "fs/promises";
import { customStringify, customStringifyPretty } from "./custom-json.js";

/** @param {string} file */
export async function readJSON(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

/**
 * @param {string} file
 * @param {any} data
 * @param {{ style?: 'compact' | 'pretty' | 'custom' | 'custom-compact'} | undefined} opts
 */
export async function writeJSON(file, data, opts = {}) {
  const style = opts.style || "compact";
  await writeFile(
    file,
    {
      compact: () => JSON.stringify(data),
      pretty: () => JSON.stringify(data, null, 2),
      custom: () => customStringifyPretty(data),
      "custom-compact": () => customStringify(data, { compact: true }),
    }[style]()
  );
}

/**
 * @param {string} file
 */
export function readJSONSync(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

/**
 * @param {string} file
 * @param {any} data
 */
export function writeJSONSync(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

/**
 * @param {string} file
 */
export async function pathExists(file) {
  try {
    await access(file);
    return true;
  } catch (e) {
    return false;
  }
}

/** @param {string} file */
export async function ensureDir(file) {
  await mkdir(file, { recursive: true });
}
