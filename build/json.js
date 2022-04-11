function escapeString(str) {
  return str.replace(/[\\"]/g, "\\$&");
}

export function stringify(value, k = undefined) {
  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map((k) => `"${escapeString(k)}":${stringify(value[k], k)}`)
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
