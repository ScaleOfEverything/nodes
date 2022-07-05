import fs from "fs-extra";
import { stringify } from "./json.js";
import sharp from "sharp";
import { createHash } from "crypto"

async function computeNodeSHA1(directory) {
  const sha1 = createHash('sha1');
  
  let blob = "";
  blob += await fs.readFile(directory + "/node.json");
  blob += await fs.readFile(directory + "/node.png");
  
  for(const file of await fs.readdir(directory + "/lang")) {
    blob += await fs.readFile(directory + "/lang/" + file);
  }

  return sha1.update(blob).digest('hex');
}

export async function buildUniverse() {
  await fs.remove("dist");

  console.log("Processing Universe Nodes");
  console.time("Processed Universe Nodes");
  const universeNodes = {};
  const languages = {};

  await fs.mkdirs("dist/universe");
  await fs.mkdirs("dist/universe/lang");
  await fs.mkdirs("dist/universe/assets");

  await fs.mkdirs(".cache");
  await fs.mkdirs(".cache/checksums");
  await fs.mkdirs(".cache/universe-nodes");
  await fs.mkdirs(".cache/lang-nodes");

  const universeNodeIds = await fs.readdir("universe");
  await Promise.all(
    universeNodeIds.map(async (id) => {
      if(id == ".DS_Store") return;
      const checksumFileExists = await fs.pathExists(`.cache/checksums/${id}.sha1`);
      if(checksumFileExists) {
        const checksum = await fs.readFile(`.cache/checksums/${id}.sha1`);
        if(checksum.toString() === await computeNodeSHA1(`universe/${id}`)) {
          const universeNode = JSON.parse(await fs.readFile(`.cache/universe-nodes/${id}.json`));
          universeNodes[id] = universeNode;

          const langNodeIds = (await fs.readdir(`universe/${id}/lang`)).map(langId => langId.replace(/\.md$/, ""));
          await Promise.all(
            langNodeIds.map(async (langId) => {
              const langNode = JSON.parse(await fs.readFile(`.cache/lang-nodes/${id}-${langId}.json`));
              languages[langId] = languages[langId] || {};
              languages[langId][id] = langNode;
            })
          );

          await fs.copy(
            `universe/${id}/node.png`,
            `dist/universe/assets/${id}.png`
          );

          return;
        } else {
          console.log(`Change detected: ${id}`);
          await fs.remove(`.cache/checksums/${id}.sha1`);
        }
      } else {
        console.log(`New node detected: ${id}`);
      }

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
        universeNodes[id].width = meta.width;
        universeNodes[id].height = meta.height;
        image.resize(Math.ceil(meta.width / 4), Math.ceil(meta.height / 4));
        image.stats()
          .then(({ channels: [rc, gc, bc] }) => {
            const r = Math.round(rc.mean);
            const g = Math.round(gc.mean);
            const b = Math.round(bc.mean);
            const color = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
            universeNodes[id].c = color;
          });
        await image.toFile(`dist/universe/assets/${id}-lq.png`);
      } else {
        console.log(`No node image for ${id}`);
      }

      fs.writeFile(`.cache/universe-nodes/${id}.json`, stringify(universeNodes[id]));

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

          fs.writeFile(`.cache/lang-nodes/${id}-${lang}.json`, stringify(langNode));
        })
      );

      fs.writeFile(`.cache/checksums/${id}.sha1`, await computeNodeSHA1(`universe/${id}`));
    })
  );

  await fs.writeFile("dist/universe/nodes.json", stringify(universeNodes));

  await Promise.all(
    Object.keys(languages).map(async (id) => {
      if(!(await fs.pathExists(`dist/universe/lang/${id}.json`))) {
        await fs.writeFile(
          `dist/universe/lang/${id}.json`,
          stringify(languages[id])
        );
      } else {
        const oldLang = JSON.parse(await fs.readFile(`dist/universe/lang/${id}.json`))
        for(const nodeId of Object.keys(languages[id])) {
          oldLang[nodeId] = languages[id][nodeId];
        }
      }
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