import json
import unittest
from pathlib import Path

from content_intelligence.engine import creative_director


ROOT = Path(__file__).resolve().parents[1]
PITCH = ROOT / "episodes" / "013" / "creative-pitch.json"
BRIEF = ROOT / "episodes" / "013" / "CREATIVE_BRIEF.md"
STORY = ROOT / "episodes" / "013" / "SCRIPT_AND_STORYBOARD.md"


class Episode013PreproductionTests(unittest.TestCase):
    def test_creative_director_gate(self):
        pitch = json.loads(PITCH.read_text(encoding="utf-8"))
        evaluation = creative_director(pitch)
        self.assertEqual(evaluation["score"], 12)
        self.assertTrue(evaluation["ready_for_production_review"])
        self.assertEqual(evaluation["hard_stops"], [])

    def test_primary_study_and_context_sources(self):
        sources = json.loads(PITCH.read_text(encoding="utf-8"))["sources"]
        self.assertTrue(any("gail.wharton.upenn.edu" in source for source in sources))
        self.assertTrue(any("mckinsey.com" in source for source in sources))
        self.assertTrue(all(source.startswith("https://") for source in sources))

    def test_illustration_and_no_publication_clarity(self):
        s = STORY.read_text(encoding="utf-8").lower()
        b = BRIEF.read_text(encoding="utf-8").lower()
        self.assertIn("illustrative recreation", s)
        self.assertIn("not live", s)
        self.assertIn("99", s)
        self.assertIn("no video", b)
        self.assertIn("not every", b)


if __name__ == "__main__":
    unittest.main()
