export async function defaultTransformNode(node, ctx) {
  return node;
}

export async function defaultProcessLangMarkdown(md, ctx) {
  const title = md.split("\n")[0].match(/^# (.*)$/)[1];
  const desc = md.split("\n").slice(1).join("\n").trim();

  const langNode = {
    title,
    desc,
  };

  return langNode;
}
