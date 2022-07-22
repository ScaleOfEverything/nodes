import { createCategory } from "../lib/util.js";

/**
 * @typedef RawDocumentaryNode
 * @prop {string} youtubeId
 *
 * @typedef DocumentaryNode
 * @prop {string} youtubeId
 */

export default createCategory({
  // Folder name
  name: "documentary",
  // URL to where we actually consume the data
  projectURL: null,

  /** @param {RawDocumentaryNode} node */
  async transformNode(node, ctx) {
    return node;
  },
});
