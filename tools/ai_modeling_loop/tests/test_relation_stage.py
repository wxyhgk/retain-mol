from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from tools.ai_modeling_loop.relation_stage import certify_relation_execution


class RelationStageTests(unittest.TestCase):
    def test_checker_exception_becomes_archivable_indeterminate_result(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "run"
            run_dir.mkdir()
            prepared = SimpleNamespace(paths=SimpleNamespace(
                run_dir=run_dir,
                relation_certificate_manifest=run_dir / "relation-certificate-manifest.json",
            ))

            def failing_checker(_run_dir: Path):
                raise OSError("checker unavailable")

            result = certify_relation_execution(prepared, checker=failing_checker)
            self.assertEqual(result["status"], "indeterminate")
            self.assertEqual(result["code"], "relation-check-failed")
            self.assertIn("OSError", result["evidence"]["error"])


if __name__ == "__main__":
    unittest.main()
