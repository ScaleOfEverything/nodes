const propertyOrder = ["id", "type", "x", "y", "size"];

function escapeString(str) {
  return str.replace(/[\\"]/g, "\\$&");
}

function sortKeys(keys) {
  return keys.sort((a, b) => {
    const aIndex = propertyOrder.indexOf(a);
    const bIndex = propertyOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    } else if (aIndex === -1) {
      return 1;
    } else if (bIndex === -1) {
      return -1;
    } else {
      return aIndex - bIndex;
    }
  });
}

export function customStringify(value, k = undefined) {
  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      "{" +
      sortKeys(Object.keys(value))
        .map((k) => `"${escapeString(k)}":${customStringify(value[k], k)}`)
        .join(",") +
      "}"
    );
  }
  if (k == "size" && typeof value === "number") {
    if (value < 0.001 || value > 9999) {
      const log10 = Math.floor(Math.log10(value));
      return `${String(
        Math.round((value / 10 ** log10) * 10000) / 10000
      )}e${log10}`;
    } else {
      return String(Math.round(value * 10000) / 10000);
    }
  }
  return JSON.stringify(value);
}

export function customStringifyPretty(value, k = undefined) {
  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      "{\n" +
      sortKeys(Object.keys(value))
        .map(
          (k) =>
            `  "${escapeString(k)}": ${customStringifyPretty(
              value[k],
              k
            ).replace(/\n/g, "\n  ")}`
        )
        .join(",\n") +
      "\n}"
    );
  }
  if (k == "size" && typeof value === "number") {
    if (value < 0.001 || value > 9999) {
      const log10 = Math.floor(Math.log10(value));
      return `${String(
        Math.round((value / 10 ** log10) * 10000) / 10000
      )}e${log10}`;
    } else {
      return String(Math.round(value * 10000) / 10000);
    }
  }
  return JSON.stringify(value, null, 2);
}
