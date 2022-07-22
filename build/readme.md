# SOE Nodes Build System

This folder contains all the code for building a Cloudflare Pages static website
off of the data, where the build step will transform the node sources to JSON.

## Structure

Everything is written in JS + JSDocs for typechecking. This lets us run the code
directly without any compiler.

Files:

- `./category/[name].js` a category definition. mainly defines a transform
  function for a node's json file.
- `./lib` contains actual code. notable files are `cache.js`, `process.js`, and
  `types.d.ts`.
- `./static` are static files copied to the build.
- `./server.js` is the dev server.
- `./index.js` is the build script.
