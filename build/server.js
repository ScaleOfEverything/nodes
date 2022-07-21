import express from "express";
import { copyFile, readdir } from "fs/promises";
import path from "path";
import { DIST_ROOT, ROOT } from "./lib/paths.js";
import { processNodeCategory } from "./lib/process.js";
import { writeJSON } from "./lib/fs.js";

console.log("Preparing live server...");

const categories = (await readdir(path.join(ROOT, "build", "category"))).map(
  (x) => x.replace(".js", "")
);

for (const c of categories) {
  await processNodeCategory((await import(`./category/${c}.js`)).default);
}

const app = express();

app.get("/");

app.listen(3001, () => {
  console.log("Server started on port 3001");
  console.log("http://localhost:3001");
});
