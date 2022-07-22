import { readdir, readFile } from "fs/promises";
import * as path from "path";
import sharp from "sharp";
import { doCachedAction, hashDirectory } from "./cache.js";
import { ensureDir, pathExists, readJSON, writeJSON } from "./fs.js";
import { CACHE_ROOT, DIST_ROOT, ROOT } from "./paths.js";
import { asyncMap } from "@davecode/utils";
import { SingleBar } from "cli-progress";
import { format } from "./progress.js";

export const processedNodes = new Map();
export const processedLangNodes = new Map();
export const rawNodes = new Map();
export const nodeLists = new Map();

/**
 * @param {import("./types").NodeCategory} category
 */
export async function processNodeCategory(category, log = true) {
  const dataRoot = path.resolve(ROOT, category.name);
  const distRoot = path.resolve(DIST_ROOT, category.name);
  const cacheJSON = path.resolve(CACHE_ROOT, `category-${category.name}.json`);

  const cache = (await pathExists(cacheJSON))
    ? new Map(await readJSON(cacheJSON))
    : new Map();

  await ensureDir(path.join(distRoot, "assets"));

  const nodeList = await readdir(dataRoot);

  nodeLists.set(category.name, nodeList);
  rawNodes.set(category.name, {});

  const bar = log
    ? new SingleBar({
        fps: 10,
        format,
      })
    : null;
  bar?.start(nodeList.length, 0, { category: category.name });

  // Kick off all hashes in parallel
  nodeList.forEach((node) => hashDirectory(path.join(dataRoot, node)));

  // Run node processing in sequence
  for (const id of nodeList) {
    const nodeRoot = path.resolve(dataRoot, id);
    bar?.increment(1, { id });

    await doCachedAction("transform-node", nodeRoot, async () => {
      const filesInNodeRoot = await readdir(nodeRoot);
      const ctx = {
        async readImage(imgId = "node") {
          if (filesInNodeRoot.includes(imgId + ".png")) {
            return sharp(path.join(nodeRoot, imgId + ".png"));
          } else {
            throw new Error(
              `Image ${imgId} not found in ${category.name}/${id}`
            );
          }
        },
        async writeImage(imgId, image) {
          if (!image) {
            image = imgId;
            imgId = "node";
          }

          await image.toFile(
            `dist/${category.name}/assets/${id}${
              imgId === "node" ? "" : `-${imgId}`
            }.png`
          );
          const meta = await image.metadata();
          image.resize(Math.ceil(meta.width / 4), Math.ceil(meta.height / 4));
          await image.toFile(
            `dist/${category.name}/assets/${id}${
              imgId === "node" ? "" : `-${imgId}`
            }-lq.png`
          );
        },
      };

      const nodeJSON = await readJSON(path.join(nodeRoot, "node.json"));
      rawNodes.get(category.name)[id] = nodeJSON;

      // mmmmm concurrency
      await Promise.all([
        category
          .transformNode(nodeJSON, ctx)
          .then((transformedNode) => cache.set("node:" + id, transformedNode))
          .catch((error) => {
            console.error(`Failed Node Processing for ${category.name}/${id}`);
            console.error(error);
            process.exit(1);
          }),

        readdir(path.join(nodeRoot, "lang")) //
          .then((languages) =>
            asyncMap(languages, async (lang) => {
              const langId = lang.replace(/\.md$/, "");
              try {
                const mdText = (
                  await readFile(path.join(nodeRoot, "lang", lang), "utf8")
                ).replace(/\r/g, "");
                const langNode = await category.processLangMarkdown(
                  mdText,
                  ctx
                );
                cache.set(`lang:${langId}:${id}`, langNode);
              } catch (error) {
                console.error(
                  `Failed Lang Processing for ${category.name}/${id}/${langId}`
                );
                console.error(error);
                process.exit(1);
              }
            })
          ),
      ]);
    });
  }
  bar?.update(nodeList.length, { done: true });
  bar?.stop();

  await writeJSON(cacheJSON, Array.from(cache.entries()));

  const langs = {};
  const nodes = {};

  for (const [key, value] of cache.entries()) {
    if (key.startsWith("node:")) {
      nodes[key.substr(5)] = value;
    } else {
      const [langId, node] = key.substr(5).split(":");
      langs[langId] = langs[langId] || {};
      langs[langId][node] = value;
    }
  }

  await ensureDir(path.join(distRoot, "lang"));

  processedNodes.set(category.name, nodes);
  processedLangNodes.set(category.name, langs);

  await Promise.all([
    writeJSON(
      path.join(distRoot, "nodes.json"),
      Object.fromEntries(
        [...cache.entries()]
          .filter(([key]) => key.startsWith("node:"))
          .map(([key, value]) => [key.split(":")[1], value])
      ),
      {
        style: "custom-compact",
      }
    ),
    ...Object.entries(langs).map(([langId, lang]) =>
      writeJSON(path.join(distRoot, `lang/${langId}.json`), lang, {
        style: "custom-compact",
      })
    ),
  ]);
}

/** @param {string} id */
export async function getRawNodes(id) {
  const dataRoot = path.resolve(ROOT, id);
  const nodes = rawNodes.get(id) ?? {};
  const keys = Object.keys(nodes);

  await Promise.all(
    nodeLists
      .get(id)
      .filter((key) => !keys.includes(key))
      .map(async (key) => {
        nodes[key] = await readJSON(path.join(dataRoot, key, "node.json"));
      })
  );

  rawNodes.set(id, nodes);
  return nodes;
}
