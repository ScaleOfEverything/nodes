import { mkdirSync } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

export const ROOT = path.resolve(__dirname, "../../");

export const CACHE_ROOT = path.resolve(ROOT, ".cache");
mkdirSync(CACHE_ROOT, { recursive: true });

export const DIST_ROOT = path.resolve(ROOT, "dist");
mkdirSync(DIST_ROOT, { recursive: true });
