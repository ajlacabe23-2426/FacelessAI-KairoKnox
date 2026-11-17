import copy
import json
from pathlib import Path
import unittest
from scripts.validate_chronicles_plan import validate

PLAN = json.loads((Path(__file__).resolve().parents[1] / "docs/production/KC002_STORY_FIRST_PLAN.json").read_text(encoding="utf-8"))

class TestChroniclesPlan(unittest.TestCase):
    def test_proposal_structural_only(self):
        self.assertEqual(validate(PLAN), [])
        self.assertTrue(validate(PLAN, release=True))
    def test_gap(self):
        plan = copy.deepcopy(PLAN)
        plan["shots"][1]["start"] += 1
        self.assertTrue(validate(plan))
    def test_duplicate_and_bad_predecessor(self):
        plan = copy.deepcopy(PLAN)
        plan["shots"][1]["id"] = plan["shots"][0]["id"]
        plan["shots"][1]["previous_id"] = None
        self.assertTrue(validate(plan))
    def test_missing_tone(self):
        plan = copy.deepcopy(PLAN)
        plan["shots"][3]["sound"] = ""
        self.assertTrue(validate(plan))
    def test_incomplete_role(self):
        plan = copy.deepcopy(PLAN)
        del plan["roles"]["grid_patrol"]
        self.assertTrue(validate(plan))
    def test_missing_act(self):
        plan = copy.deepcopy(PLAN)
        for shot in plan["shots"]:
            if shot["act"] == "discovery":
                shot["act"] = "aftermath"
        self.assertTrue(validate(plan))
