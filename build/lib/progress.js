import chalk from "chalk";

const boxChars = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];

export function genProgressBar(progress, width) {
  if (progress >= 1) return chalk.hsv(120, 80, 100)("█".repeat(width));
  if (progress <= 0) return chalk.hsv(0, 80, 50)("█".repeat(width));
  if (isNaN(progress) || !(progress > 0 && progress < 1))
    return chalk.hsv(270, 100, 50)("█".repeat(width));

  const wholeWidth = Math.floor(progress * width);
  const remainderWidth = (progress * width) % 1;
  const partWidth = Math.floor(remainderWidth * 8);
  let partChar = boxChars[partWidth];
  if (width - wholeWidth - 1 < 0) partChar = "";

  const fill = "█".repeat(wholeWidth);
  const empty = " ".repeat(width - wholeWidth - 1);

  return chalk.hsv(progress * 120, 80, 100).bgHsv(progress * 120, 80, 50)(
    `${fill}${partChar}${empty}`
  );
}

/** @type {import("cli-progress").GenericFormatter} */
export function format(opts, params, payload) {
  if (payload.done) {
    return (
      chalk.magentaBright(payload.category) +
      " | " +
      chalk.green(`Built ${params.total} nodes!`)
    );
  }

  return (
    chalk.magentaBright(payload.category) +
    " " +
    genProgressBar(params.progress, 30) +
    " " +
    chalk.greenBright(`${params.value}/${params.total}`) +
    " | " +
    chalk.redBright(payload.id)
  );
}
