"""Prepare explorer assets; optionally serve and open the standalone viewer."""

# cspell:ignore shutil webbrowser functools copyfile

import argparse
import json
import shutil
import threading
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

EXPLORER = Path(__file__).resolve().parent
ROOT = EXPLORER.parents[1]


def prepare():
    """Copy canonical models and generate a catalog for the documentation build."""
    destination = EXPLORER / "models"
    destination.mkdir(exist_ok=True)
    catalog = []
    sources = sorted((ROOT / "models").glob("*.json"))
    for source in sources:
        model = json.loads(source.read_text())
        distributions = model.get("distributions", [])
        kinematics = next(
            (
                d["decay_description"]["kinematics"]
                for d in distributions
                if "kinematics" in d.get("decay_description", {})
            ),
            None,
        )
        label = source.stem
        if kinematics:
            initial = kinematics["initial_state"]["name"]
            final = " ".join(p["name"] for p in kinematics["final_state"])
            label = f"{initial} → {final} · {source.stem}"
        catalog.append({"id": source.stem, "label": label})
        shutil.copyfile(source, destination / source.name)
    # Remove only stale generated model copies, never canonical inputs.
    expected = {p.name for p in sources} | {"index.json"}
    for generated in destination.glob("*.json"):
        if generated.name not in expected:
            generated.unlink()
    (destination / "index.json").write_text(json.dumps(catalog, indent=2) + "\n")
    return catalog


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--open", action="store_true", dest="open_browser")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    prepare()
    if not args.serve:
        return
    if not 0 <= args.port <= 65535:
        parser.error("port must be between 0 and 65535")
    handler = partial(SimpleHTTPRequestHandler, directory=EXPLORER)
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        parser.exit(1, f"Cannot start explorer: {error}. Try PORT=8001.\n")
    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"Amplitude Model Explorer: {url}\nPress Ctrl-C to stop.", flush=True)
    if args.open_browser:
        threading.Timer(0.2, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
