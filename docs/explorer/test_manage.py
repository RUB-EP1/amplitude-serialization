"""Test generated assets independently of the working repository."""

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import manage


class CatalogTest(unittest.TestCase):
    def test_discovers_models_preserves_data_and_removes_stale_copies(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            models = root / "models"
            explorer = root / "docs" / "explorer"
            models.mkdir()
            explorer.mkdir(parents=True)
            value = {"distributions": []}
            original = json.dumps(value, indent=4) + "\n"
            (models / "new-model.json").write_text(original)
            with patch.object(manage, "ROOT", root), patch.object(
                manage, "EXPLORER", explorer
            ):
                catalog = manage.prepare()
                self.assertEqual(catalog, [{"id": "new-model", "label": "new-model"}])
                generated = explorer / "models"
                self.assertEqual((generated / "new-model.json").read_text(), original)
                self.assertEqual(json.loads((generated / "index.json").read_text()), catalog)
                (models / "new-model.json").unlink()
                manage.prepare()
                self.assertFalse((generated / "new-model.json").exists())
                self.assertEqual(json.loads((generated / "index.json").read_text()), [])


if __name__ == "__main__":
    unittest.main()
