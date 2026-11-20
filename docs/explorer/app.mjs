import {
  isObject,
  getAt,
  validPath,
  initialPaths,
  validateModel,
  referenceIndex,
  resolveReference,
  couplingLabel,
  decayContext,
  category,
  pathLabel,
  treeLayout,
} from "./model.mjs";
const $ = (selector) => document.querySelector(selector);
let model,
  paths = [],
  references,
  modelId,
  loadId = 0;
let catalog = [];
const el = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};
function button(text, action, className = "") {
  const b = el("button", className, text);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}
function save() {
  if (!modelId) return;
  try {
    localStorage.setItem(
      `amplitude-explorer:${modelId}`,
      JSON.stringify(paths),
    );
  } catch {
    /* Storage may be disabled. */
  }
}
function navigate(path, columnIndex) {
  paths = paths.slice(0, columnIndex + 1);
  paths.push(path);
  render();
  save();
}
function selected(path, index) {
  return JSON.stringify(paths[index + 1]) === JSON.stringify(path);
}
function referenceButton(path, text, index) {
  const b = button(text, () => navigate(path, index), "reference");
  b.append(el("small", "", `Open ${path[0].replaceAll("_", " ")} definition`));
  return b;
}
function renderField(key, value, path, columnIndex) {
  const field = el("div", "field");
  const heading = el("div", "field-name", key);
  field.append(heading);
  if (isObject(value)) {
    const array = Array.isArray(value),
      count = Object.keys(value).length;
    heading.append(
      el(
        "span",
        "count",
        array
          ? `${count} ${count === 1 ? "item" : "items"}`
          : `${count} fields`,
      ),
    );
    const items = el("div", "items");
    field.append(items);
    if (!count) {
      items.append(el("span", "empty", array ? "[ ]" : "{ }"));
      return field;
    }
    // Nested scalar arrays (topologies, matrices) retain their precise structure.
    const scalarTree = (v) =>
      Array.isArray(v) ? v.every(scalarTree) : !isObject(v);
    if (array && scalarTree(value)) {
      items.append(el("div", "value", JSON.stringify(value)));
      return field;
    }
    if (array) {
      value.forEach((item, i) => {
        const p = [...path, i];
        const name = isObject(item) ? (item.name ?? item.type) : String(item);
        const b = button("", () => navigate(p, columnIndex));
        b.append(
          el("span", "item-index", `[${i}]`),
          document.createTextNode(name === undefined ? "object" : String(name)),
        );
        b.setAttribute("aria-pressed", String(selected(p, columnIndex)));
        if (item?.vertices) b.title = couplingLabel(item);
        b.setAttribute(
          "aria-label",
          `${key}[${i}]${name === undefined ? "" : ": " + name}${item?.vertices ? "; " + couplingLabel(item) : ""}`,
        );
        items.append(b);
      });
    } else {
      const b = button(
        "{ " + count + " fields }",
        () => navigate(path, columnIndex),
        "object-button",
      );
      b.setAttribute("aria-pressed", String(selected(path, columnIndex)));
      b.setAttribute("aria-label", `Open ${key}`);
      items.append(b);
    }
  } else {
    const matches = resolveReference(references, key, value);
    if (matches.length) {
      const items = el("div", "items");
      matches.forEach((p) =>
        items.append(referenceButton(p, String(value), columnIndex)),
      );
      field.append(items);
    } else
      field.append(
        el(
          "div",
          value === null || value === "" ? "value empty" : "value",
          value === "" ? '""' : String(value),
        ),
      );
  }
  return field;
}
function drawTree(chain, path) {
  const decay = decayContext(model, path);
  if (!decay?.kinematics || !Array.isArray(chain.topology)) return null;
  const kin = decay.kinematics,
    layout = treeLayout(chain.topology);
  const width = 340,
    height = Math.max(150, layout.leaves * 62),
    step = 240 / Math.max(1, layout.depth);
  const nodeLabel = (n) =>
    n.depth === 0
      ? String(kin.initial_state?.name ?? "initial")
      : n.leaf
        ? String(
            kin.final_state?.find((p) => p.index === n.value)?.name ?? n.value,
          )
        : String(
            chain.propagators?.find(
              (p) => JSON.stringify(p.node) === JSON.stringify(n.value),
            )?.parametrization ?? "intermediate",
          );
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("tree");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    `${chain.name ?? "Decay"} topology; ${layout.nodes
      .filter((n) => n.leaf)
      .map(nodeLabel)
      .join(", ")}`,
  );
  const add = (tag, attrs, text) => {
    const n = document.createElementNS(svg.namespaceURI, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (text !== undefined) n.textContent = text;
    svg.append(n);
    return n;
  };
  const x = (n) => 22 + n.depth * step,
    y = (n) => 28 + n.row * 58;
  layout.edges.forEach((e) =>
    add("line", { x1: x(e.from), y1: y(e.from), x2: x(e.to), y2: y(e.to) }),
  );
  layout.nodes.forEach((n) => {
    add("circle", { cx: x(n), cy: y(n), r: 3.5 });
    const label = nodeLabel(n);
    const t = add(
      "text",
      {
        x: x(n) + (n.leaf ? 10 : 0),
        y: y(n) + (n.leaf ? 5 : 22),
        "text-anchor": n.leaf ? "start" : n.depth ? "middle" : "start",
      },
      label.length > 19 ? label.slice(0, 17) + "…" : label,
    );
    const title = document.createElementNS(svg.namespaceURI, "title");
    title.textContent = label;
    t.append(title);
  });
  return svg;
}
function relatedFunctions(object, index) {
  if (!Array.isArray(object?.vertices) && !Array.isArray(object?.propagators))
    return null;
  const names = [
    ...new Set(
      [
        ...(object.propagators || []).map((p) => p.parametrization),
        ...(object.vertices || []).map((v) => v.formfactor),
      ].filter(Boolean),
    ),
  ];
  if (!names.length) return null;
  const box = el("div", "related");
  box.append(el("h3", "", "Referenced functions"));
  const items = el("div", "items");
  box.append(items);
  names.forEach((name) => {
    const matches = resolveReference(references, "parametrization", name);
    if (matches.length)
      matches.forEach((p) => items.append(referenceButton(p, name, index)));
    else items.append(el("div", "value", `${name} · definition missing`));
  });
  return box;
}
function render() {
  $("#columns").replaceChildren();
  $("#breadcrumbs").replaceChildren();
  paths.forEach((path, i) => {
    if (i) $("#breadcrumbs").append(el("span", "separator", "/"));
    const b = button(pathLabel(path), () => {
      paths = paths.slice(0, i + 1);
      render();
      save();
    });
    b.setAttribute("aria-pressed", String(i === paths.length - 1));
    $("#breadcrumbs").append(b);
  });
  const start = Math.max(0, paths.length - 3);
  paths.slice(start).forEach((path, j) => {
    const index = start + j,
      object = getAt(model, path),
      panel = el("section", `panel ${category(path)}`),
      head = el("div", "panel-heading");
    head.append(
      el("h2", "", pathLabel(path)),
      el(
        "span",
        "kind",
        Array.isArray(object)
          ? "array"
          : object === null
            ? "null"
            : typeof object,
      ),
    );
    panel.append(head);
    if (object?.topology) {
      const tree = drawTree(object, path);
      if (tree) panel.append(tree);
    }
    if (isObject(object)) {
      if (!Object.keys(object).length)
        panel.append(el("div", "empty", Array.isArray(object) ? "[ ]" : "{ }"));
      Object.entries(object).forEach(([key, value]) =>
        panel.append(
          renderField(
            key,
            value,
            [...path, Array.isArray(object) ? Number(key) : key],
            index,
          ),
        ),
      );
      const related = relatedFunctions(object, index);
      if (related) panel.append(related);
    } else panel.append(el("div", "value", JSON.stringify(object)));
    $("#columns").append(panel);
  });
  $("#raw").textContent = JSON.stringify(getAt(model, paths.at(-1)), null, 2);
  $("#announcement").textContent =
    `Selected ${paths.at(-1).join(".") || "root"}`;
}
function activate(data, id, filename) {
  validateModel(data);
  model = data;
  modelId = id;
  references = referenceIndex(model);
  paths = initialPaths(model);
  try {
    const saved = JSON.parse(localStorage.getItem(`amplitude-explorer:${id}`));
    if (
      id &&
      Array.isArray(saved) &&
      saved.length &&
      saved.length < 100 &&
      saved.every((p) => validPath(model, p))
    )
      paths = saved;
  } catch {
    /* Ignore stale state. */
  }
  $("#filename").textContent = filename;
  const distributions = model.distributions.length,
    chains = model.distributions.reduce(
      (s, d) =>
        s +
        (Array.isArray(d?.decay_description?.chains)
          ? d.decay_description.chains.length
          : 0),
      0,
    );
  $("#counts").textContent =
    `${distributions} ${distributions === 1 ? "distribution" : "distributions"} · ${chains} chains · ${model.functions?.length ?? 0} functions`;
  $("#source").hidden = !id;
  $("#source").href = id
    ? `https://github.com/RUB-EP1/amplitude-serialization/blob/main/models/${id}.json`
    : "";
  const url = new URL(location.href);
  if (id) url.searchParams.set("model", id);
  else url.searchParams.delete("model");
  history.replaceState(null, "", url);
  $("#error").hidden = true;
  render();
}
function error(e) {
  $("#error").textContent = e.message || "Unable to open this model.";
  $("#error").hidden = false;
}
async function loadExample(id) {
  const request = ++loadId;
  $("#columns").setAttribute("aria-busy", "true");
  try {
    const response = await fetch(`models/${encodeURIComponent(id)}.json`);
    if (!response.ok)
      throw new Error(`Could not load model (HTTP ${response.status}).`);
    const data = await response.json();
    if (request !== loadId) return;
    activate(data, id, `${id}.json`);
  } catch (e) {
    if (request === loadId) {
      error(e);
      $("#model").value = modelId || "local";
    }
  } finally {
    if (request === loadId) $("#columns").setAttribute("aria-busy", "false");
  }
}
$("#model").addEventListener("change", (e) => {
  if (e.target.value !== "local") loadExample(e.target.value);
});
$("#file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const request = ++loadId;
  try {
    if (file.size > 10 * 1024 * 1024)
      throw new Error("Choose a JSON file smaller than 10 MB.");
    const data = JSON.parse(await file.text());
    if (request !== loadId) return;
    activate(data, null, file.name);
    let option = $('#model option[value="local"]');
    if (!option) {
      option = el("option", "", "Local JSON");
      option.value = "local";
      $("#model").append(option);
    }
    $("#model").value = "local";
    $("#model").disabled = false;
  } catch (e) {
    if (request === loadId) error(e);
  } finally {
    e.target.value = "";
    if (request === loadId) $("#columns").setAttribute("aria-busy", "false");
  }
});
async function initialize() {
  try {
    const response = await fetch("models/index.json");
    if (!response.ok)
      throw new Error(
        "Model catalog unavailable. Run pixi run explorer or rebuild the documentation.",
      );
    catalog = await response.json();
    if (!Array.isArray(catalog) || !catalog.length)
      throw new Error(
        "No model examples were found. You can still open a local JSON file.",
      );
    $("#model").replaceChildren();
    catalog.forEach((item) => {
      const option = el("option", "", item.label);
      option.value = item.id;
      $("#model").append(option);
    });
    const requested = new URL(location.href).searchParams.get("model");
    const id = catalog.some((item) => item.id === requested)
      ? requested
      : catalog[0].id;
    $("#model").value = id;
    $("#model").disabled = false;
    await loadExample(id);
  } catch (e) {
    error(e);
    $("#columns").setAttribute("aria-busy", "false");
  }
}
initialize();
