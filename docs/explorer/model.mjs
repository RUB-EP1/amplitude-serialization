/** Pure model helpers; no assumptions about the number of distributions or couplings. */
export const isObject = (value) => value !== null && typeof value === "object";
export function getAt(model, path) {
  return path.reduce(
    (value, key) =>
      isObject(value) && Object.hasOwn(value, key) ? value[key] : undefined,
    model,
  );
}
export function validPath(model, path) {
  return (
    Array.isArray(path) &&
    path.length < 100 &&
    path.every((k) => typeof k === "string" || Number.isInteger(k)) &&
    getAt(model, path) !== undefined
  );
}
export function initialPaths(model) {
  const paths = [[]];
  if (model.distributions?.length > 0) {
    paths.push(["distributions", 0]);
    if (isObject(model.distributions[0].decay_description))
      paths.push(["distributions", 0, "decay_description"]);
  }
  return paths;
}
export function validateModel(model) {
  if (!isObject(model) || Array.isArray(model))
    throw new Error("Choose a JSON object containing an amplitude model.");
  if (!Array.isArray(model.distributions))
    throw new Error("The model must contain a distributions array.");
  if (model.functions !== undefined && !Array.isArray(model.functions))
    throw new Error("The functions field must be an array.");
  if (!model.distributions.every((d) => isObject(d) && !Array.isArray(d)))
    throw new Error("Each distribution must be an object.");
  return model;
}
export function referenceIndex(model) {
  const index = new Map();
  for (const key of [
    "functions",
    "distributions",
    "parameter_points",
    "domains",
  ]) {
    (Array.isArray(model[key]) ? model[key] : []).forEach((item, i) => {
      if (typeof item?.name !== "string") return;
      const matches = index.get(item.name) || [];
      matches.push([key, i]);
      index.set(item.name, matches);
    });
  }
  return index;
}
export function resolveReference(index, key, value) {
  if (key === "name" || typeof value !== "string" || !value) return [];
  const matches = index.get(value) || [];
  const category = {
    parametrization: "functions",
    formfactor: "functions",
    point: "parameter_points",
  }[key];
  return category ? matches.filter((p) => p[0] === category) : matches;
}
export function couplingLabel(chain) {
  return (chain?.vertices || [])
    .map((v) =>
      v.type === "ls"
        ? `LS (${v.l}, ${v.s})`
        : Array.isArray(v.helicities)
          ? `${v.type} (${v.helicities.join(", ")})`
          : String(v.type || "vertex"),
    )
    .join(" · ");
}
export function decayContext(model, path) {
  if (path[0] !== "distributions" || !Number.isInteger(path[1])) return null;
  return model.distributions?.[path[1]]?.decay_description;
}
export function category(path) {
  return path[0] === "functions"
    ? "function"
    : path.includes("decay_description")
      ? "decay"
      : path[0] === "distributions"
        ? "distribution"
        : "root";
}
export function pathLabel(path) {
  if (!path.length) return "root";
  const last = path.at(-1);
  return typeof last === "number" ? `${path.at(-2)}[${last}]` : last;
}
/** Recursively lay out any nested decay topology; leaves retain particle indices. */
export function treeLayout(topology) {
  let leaf = 0;
  const nodes = [],
    edges = [];
  function walk(value, depth) {
    const node = { value, depth, leaf: !Array.isArray(value) };
    nodes.push(node);
    if (node.leaf) node.row = leaf++;
    else {
      const children = value.map((v) => walk(v, depth + 1));
      node.row = children.length
        ? children.reduce((s, c) => s + c.row, 0) / children.length
        : leaf++;
      children.forEach((child) => edges.push({ from: node, to: child }));
    }
    return node;
  }
  walk(topology, 0);
  return {
    nodes,
    edges,
    leaves: leaf,
    depth: Math.max(...nodes.map((n) => n.depth)),
  };
}
