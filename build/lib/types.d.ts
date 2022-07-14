import { Awaitable } from "@davecode/types";
import { Sharp } from "sharp";

export interface NodeCategory<RawNode> {
  name: string;
  projectURL: string;

  /** Defaults to passing the node json straight through, and transforming the `node` image. */
  transformNode?(node: RawNode, ctx: BuildContext): Awaitable<any>;
  processLangMarkdown?(md: string, ctx: BuildContext): Awaitable<any>;
}

export interface BuildContext {
  /** Pass a string of an image id, essentially the path without the `.extension` */
  readImage(id?: string): Promise<Sharp>;
  /** Pass an id and a sharp to write it to the build output. ID defaults to `node` if not given */
  writeImage(image: Sharp): Promise<void>;
  writeImage(id: string, image: Sharp): Promise<void>;
}
