import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getAt,
  initialPaths,
  validateModel,
  referenceIndex,
  resolveReference,
  couplingLabel,
  decayContext,
  treeLayout,
  validPath,
} from "./model.mjs";
const cases = [
  ["lc2ppik-lhcb-2683025", 1, 26],
  ["lb2pkg-lhcb-2765817", 1, 74],
  ["x2pipipi-compass-1391643", 4, 28],
];
for (const [name, nDistributions, nChains] of cases) {
  test(`${name}: all chains and function references are navigable`, async () => {
    const model = JSON.parse(
      await readFile(
        new URL(`../../models/${name}.json`, import.meta.url),
        "utf8",
      ),
    );
    validateModel(model);
    assert.equal(model.distributions.length, nDistributions);
    assert.equal(
      model.distributions.reduce(
        (s, d) => s + d.decay_description.chains.length,
        0,
      ),
      nChains,
    );
    const index = referenceIndex(model);
    for (const [d, distribution] of model.distributions.entries()) {
      for (const [
        c,
        chain,
      ] of distribution.decay_description.chains.entries()) {
        const path = ["distributions", d, "decay_description", "chains", c];
        assert.equal(getAt(model, path), chain);
        assert.equal(
          decayContext(model, path).kinematics,
          distribution.decay_description.kinematics,
        );
        assert(couplingLabel(chain).length > 0);
        const layout = treeLayout(chain.topology);
        assert.equal(layout.leaves, 3);
        assert.equal(layout.edges.length, layout.nodes.length - 1);
        for (const ref of [
          ...chain.propagators.map((p) => p.parametrization),
          ...chain.vertices.map((v) => v.formfactor),
        ].filter(Boolean)) {
          const matches = resolveReference(index, "parametrization", ref);
          assert(matches.length > 0, `Missing ${ref}`);
          matches.forEach((p) => assert.equal(getAt(model, p).name, ref));
        }
      }
    }
    assert.equal(initialPaths(model).length, 3);
  });
}
test("robust references, missing values, and untrusted property names", () => {
  assert.throws(() => validateModel(null));
  assert.throws(() => validateModel([]));
  assert.throws(() => validateModel({}));
  assert.throws(() => validateModel({ distributions: [], functions: 3 }));
  const m = {
    distributions: [],
    functions: [{ name: "same" }, { name: "same" }],
    parameter_points: [{ name: "same" }],
  };
  const index = referenceIndex(m);
  assert.equal(resolveReference(index, "formfactor", "same").length, 2);
  assert.equal(resolveReference(index, "point", "same").length, 1);
  assert.equal(resolveReference(index, "name", "same").length, 0);
  assert.equal(getAt(m, ["__proto__"]), undefined);
  assert.equal(validPath(m, ["missing"]), false);
  assert.equal(validPath(m, []), true);
  assert.equal(
    couplingLabel({ vertices: [{ type: "ls", l: "2", s: "3/2" }] }),
    "LS (2, 3/2)",
  );
  assert.equal(treeLayout([1, [2, [3, 4]]]).leaves, 4);
});
