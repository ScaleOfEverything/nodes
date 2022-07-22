# Scale of Everything's Data

All data in our project is stored as "nodes", where each node is a folder that represents an object or idea. A node's folder contains common node information in JSON format, and then localized titles and descriptions in markdown files. Depending on the category, the exact format differs.

There is a build process that converts this data into compressed JSON data which is then pulled in by our various projects. You can see the code for the build system in `./build`.

We accept new contributions for nodes as well as attempts to localize the node content. Please open an issue or pull request for your desired modifications.

## Contents

Nodes are categorized by project via a top level category folder. Our current projects are:

| ID | Project | Node Count |
| --- | --- | --- |
| **`universe`** | [Scale of the Universe 3](https://scaleofeverything.com) | 298 |
| **`documentary`** | The collection of educational documentaries we link to on our site. | 10 |

## Running Locally / Testing Changes

With [Node.js](https://nodejs.org) installed, you can run `npm i` to install dependencies, and then `npm run dev` to run a development server, which will allow you to test your changes and edit them in real time. Running this for your first time will require all nodes to be built, which may take a minute.

If you are working on the web frontend, you can specify the `VITE_PUBLIC_NODE_BASE` variable in the `.env` file.
