import chalk from "chalk";
import { watch } from "chokidar";
import express from "express";
import { readdir } from "fs/promises";
import ora, { oraPromise } from "ora";
import path from "path";
import { removeHashCacheOn } from "./lib/cache.js";
import { customStringify } from "./lib/custom-json.js";
import { ROOT } from "./lib/paths.js";
import {
  getRawNodes,
  processedNodes,
  processNodeCategory,
} from "./lib/process.js";

console.log("Preparing Scale of Everything development server...");
console.log();

const categories = await Promise.all(
  (await readdir(path.join(ROOT, "build", "category")))
    .map((x) => x.replace(".js", ""))
    .map(async (c) => (await import(`./category/${c}.js`)).default)
);

for (const c of categories) {
  await processNodeCategory(c);
}

console.log();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/:category/nodes.json", async (req, res) => {
  const category = req.params.category;
  const nodes = processedNodes.get(category);
  const obj = {
    ...nodes,
    devServer: {
      rawNodes: await getRawNodes(category),
    },
  };
  res.header("Content-Type", "application/json");
  res.send(customStringify(obj));
});

app.get("/build.json", (req, res) => {
  res.send({
    id: "dev",
    timestamp: new Date().toISOString(),
    categories: categories.map((c) => ({
      name: c.name,
      projectURL: c.projectURL,
    })),
    editable: true,
  });
});

app.post("/:category/:node", async (req, res) => {
  const category = req.params.category;
  const node = req.params.node;
  const body = req.body;
  // TODO: implement this
  console.log(`${category}/${node}`, body);
});

app.use(express.static(path.join(ROOT, "build/static")));
app.use(express.static(path.join(ROOT, "dist")));

app.listen(3001, () => {
  console.log(chalk.greenBright("Running on port 8380"));
  console.log();
  console.log("URLs to run our projects on the local dataset:");
  for (const category of categories) {
    console.log(
      "  " +
        chalk.magentaBright(category.name) +
        ": " +
        chalk.cyan(`${category.projectURL}?data=localhost:8380`)
    );
  }
  console.log();
  console.log("Watching for file edits...");
  console.log();
});

const watcher = watch(
  categories.map((c) => path.join(ROOT, c.name)),
  { ignoreInitial: true }
);
watcher.on("change", async (file) => {
  const [categoryName, nodeName, ...restPath] = path
    .relative(ROOT, file)
    .replace(/\\/g, "/")
    .split("/");

  oraPromise(
    async () => {
      const category = categories.find((c) => c.name === categoryName);
      removeHashCacheOn(path.join(ROOT, categoryName, nodeName));
      await processNodeCategory(category, false);
    },
    {
      text:
        "building: " +
        chalk.yellowBright(categoryName) +
        "/" +
        chalk.redBright(nodeName),
      successText:
        "updated:  " +
        chalk.yellowBright(categoryName) +
        "/" +
        chalk.redBright(nodeName),
    }
  );
});
