# Scale of Everything's Data

All data in our project is stored as "nodes", where each node is a folder that
represents some object. A node's folder contains common node information in JSON
format, and then localized titles and descriptions in markdown files. The node's
category determines what extra properties and files it has.

There is a build process that converts this data into compressed JSON data which
is then pulled in by our various projects. You can see the code for the build
system in `src`.

We accept new contributions for nodes as well as attempts to localize the node
content. Please open an issue or pull request for your desired modifications.

## Current Nodes

The current node categories exist:

- **`universe`**: Scale of the Universe 3
