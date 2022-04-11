// This is the entry file for the build process.

import fs from "fs-extra";
import { stringify } from "./json.js";
import sharp from "sharp";

async function run() {
  await fs.remove("dist");

  console.log("Processing Universe Nodes");
  console.time("Processed Universe Nodes");
  const universeNodes = {};
  const languages = {};

  await fs.mkdirs("dist/universe");
  await fs.mkdirs("dist/universe/lang");
  await fs.mkdirs("dist/universe/assets");

  const universeNodeIds = await fs.readdir("universe");
  await Promise.all(
    universeNodeIds.map(async (id) => {
      const node = await fs.readJSON(`universe/${id}/node.json`);
      universeNodes[id] = node;

      const files = await fs.readdir(`universe/${id}`);
      if (files.includes("node.png")) {
        await fs.copy(
          `universe/${id}/node.png`,
          `dist/universe/assets/${id}.png`
        );

        const image = sharp(`universe/${id}/node.png`);
        const meta = await image.metadata();
        image.resize(Math.ceil(meta.width / 4), Math.ceil(meta.height / 4));
        await image.toFile(`dist/universe/assets/${id}-lq.png`);
      } else {
        console.log(`No node image for ${id}`);
      }

      const langs = await fs.readdir(`universe/${id}/lang`);
      await Promise.all(
        langs.map(async (lang) => {
          lang = lang.replace(/\.md$/, "");

          const md = (
            await fs.readFile(`universe/${id}/lang/${lang}.md`)
          ).toString();

          const title = md.split("\n")[0].match(/^# (.*)$/)[1];
          const desc = md.split("\n").slice(1).join("\n").trim();

          const langNode = {
            title,
            desc,
          };

          languages[lang] = languages[lang] || {};
          languages[lang][id] = langNode;
        })
      );
    })
  );

  await fs.writeFile("dist/universe/nodes.json", stringify(universeNodes));

  await Promise.all(
    Object.keys(languages).map(async (id) => {
      await fs.writeFile(
        `dist/universe/lang/${id}.json`,
        stringify(languages[id])
      );
    })
  );

  console.timeEnd("Processed Universe Nodes");
  console.log();

  await fs.writeJSON("dist/build.json", {
    id: process.env.CF_PAGES_COMMIT_SHA || "dev",
    timestamp: new Date().toISOString(),
    nodeTypes: ["universe"],
  });

  await fs.copy("build/static", "dist");
}

run();
