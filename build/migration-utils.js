import fs from "fs-extra";
import { stringifyPretty } from "./json.js";

export async function forAllNodes(set = 'universe', cb) {
  const dirs = await fs.readdir('./' + set);
  for (const dir of dirs) {
    cb({
      name: dir,
      path: './' + set + '/' + dir,
      async mapNodeJSON(mapper) {
        const json = await fs.readJSON('./' + set + '/' + dir + '/node.json');
        const newJSON = mapper(json);
        await fs.writeFile('./' + set + '/' + dir + '/node.json', stringifyPretty(newJSON));
      }
    });
  }
}