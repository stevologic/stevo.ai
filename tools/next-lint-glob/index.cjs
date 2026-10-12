// Scoped to Next's getRootDirs caller; preserve fast-glob directory semantics.
const path = module.require("node:path");
const { globSync: safeGlobSync } = module.require("tinyglobby");

exports.globSync = (pattern, options) => {
  if (typeof pattern !== "string" || options?.onlyDirectories !== true) {
    throw new TypeError("Next lint adapter requires a directory root pattern");
  }
  return safeGlobSync(pattern, {
    ...options,
    expandDirectories: false,
    absolute: path.isAbsolute(pattern),
  }).map((match) => match === "/" || /^[A-Za-z]:\/$/.test(match) ? match : match.replace(/\/$/, ""));
};
