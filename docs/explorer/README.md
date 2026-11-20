# Amplitude Model Explorer

The explorer makes the serialized model structure easy to navigate: follow a distribution into its decay chains, inspect helicity or LS vertices, and open the referenced propagator and form-factor definitions without searching through a large JSON file. The latest three objects remain visible, with breadcrumbs for returning to earlier selections. A JSON disclosure preserves the exact stored values.

This is a structure viewer. It does not evaluate amplitudes or replace the Python and Julia examples. Local JSON files are read in the browser and are never uploaded. The interface has no runtime dependencies, external fonts, or network services.

## Development

From the repository root, run `pixi run explorer`. This opens the viewer at `http://127.0.0.1:8000/` without building the notebooks; Ctrl-C stops the server. Append `--port 8001` to use another port. `pixi run test-explorer` runs the navigation and reference tests. Pixi installs Python and Node.js, so no other tools are needed. To see the explorer within the full website, run `pixi run doc` or `pixi run doclive`.

Quarto invokes `manage.py` before rendering. It generates an ignored catalog and copies the canonical `models/*.json` into the explorer resources. Adding a model to that directory automatically adds it to the picker on the next build. Generated copies are never committed. The existing documentation workflow publishes the static viewer with the rest of the site.

Links such as `index.html?model=lc2ppik-lhcb-2683025` select a bundled model. Navigation within each model is remembered in local browser storage. Object indices are zero-based. The topology diagram uses the selected distribution's kinematics.
