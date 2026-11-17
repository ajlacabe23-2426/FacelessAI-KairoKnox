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
        self.assertIn("75", s)
        self.assertIn("$29.99", s)
        self.assertIn("$359+", s)
        self.assertIn("i love hiking", s)
        self.assertNotIn("99 percentage points", s)
        self.assertIn("fraser voiceover is not included", b)
        self.assertIn("nothing was published", b)
        self.assertIn("other models behaved differently", b)

    def test_character_mix_and_approved_story_persist(self):
        pitch = json.loads(PITCH.read_text(encoding="utf-8"))
        self.assertEqual(pitch["personality_profile"]["mysterious_investigator_pct"], 45)
        self.assertEqual(pitch["personality_profile"]["witty_tech_analyst_pct"], 55)
        experiment = json.loads((ROOT / "episodes" / "013" / "PLANNED_EXPERIMENT.json").read_text(encoding="utf-8"))
        self.assertEqual(experiment["status"], "planned")
        self.assertEqual(experiment["personality_mix"]["witty_analyst_pct"], 55)
        self.assertEqual(len({v["variant_id"] for v in experiment["variants"]}), 2)
        self.assertTrue(all(v["platform_post_id"] is None for v in experiment["variants"]))


if __name__ == "__main__":
    unittest.main()
