import { createCategory } from "../lib/util.js";

export default createCategory({
  // Folder name
  name: "universe",
  // URL to where we actually consume the data
  projectURL: "https://scaleofeverything.com",

  // Transform one node
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
