import { createCategory } from "../lib/util.js";

/**
 * @typedef RawUniverseNode
 * @prop {number} x - visual offset
 * @prop {number} y - visual offset
 * @prop {number} size - in meters, use exponent notation like `4.3e7`
 * @prop {number[]} measurePoints - [x1, y1, x2, y2] marking where the measurement is
 *
 * @typedef UniverseNode
 * @prop {number} x - visual offset
 * @prop {number} y - visual offset
 * @prop {number} size - in meters, use exponent notation like `4.3e7`
 * @prop {number[]} measurePoints
 * @prop {number} width - calculated image width
 * @prop {number} height - calculated image height
 * @prop {number} c - image color
 */

export default createCategory({
  // Folder name
  name: "universe",
  // URL to where we actually consume the data
  projectURL: "https://scaleofeverything.com",

  /** @param {RawUniverseNode} node */
  async transformNode(node, ctx) {
    const img = await ctx.readImage();
    const stats = await img.stats();
    const metadata = await img.metadata();

    const r = Math.round(stats.channels[0].mean);
    const g = Math.round(stats.channels[1].mean);
    const b = Math.round(stats.channels[2].mean);
    const color =
      "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

    ctx.writeImage(img);

    return {
      x: node.x,
      y: node.y,
      size: node.size,
      c: color,
      measurePoints: node.measurePoints,
      width: metadata.width,
      height: metadata.height,
    };
  },
});
