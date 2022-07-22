import { copyFile, readdir } from "fs/promises";
import path from "path";
import { DIST_ROOT, ROOT } from "./lib/paths.js";
import { processNodeCategory } from "./lib/process.js";
import { writeJSON } from "./lib/fs.js";

const categories = await Promise.all(
  (await readdir(path.join(ROOT, "build", "category")))
    .map((x) => x.replace(".js", ""))
    .map(async (c) => (await import(`./category/${c}.js`)).default)
);

for (const c of categories) {
  await processNodeCategory(c);
}

const build = {
  id: process.env.CF_PAGES_COMMIT_SHA || "dev",
  timestamp: new Date().toISOString(),
  categories: categories.map((c) => ({
    name: c.name,
    projectURL: c.projectURL,
  })),
};

await writeJSON(path.join(DIST_ROOT, "build.json"), build, {
  style: "compact",
});

await copyFile(
  path.join(ROOT, "build/static/index.html"),
  path.join(DIST_ROOT, "index.html")
);

await copyFile(
  path.join(ROOT, "build/static/robots.txt"),
  path.join(DIST_ROOT, "robots.txt")
);
