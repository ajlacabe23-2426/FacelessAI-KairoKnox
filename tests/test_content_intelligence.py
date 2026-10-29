import copy
import unittest
from datetime import datetime, timezone, timedelta

from content_intelligence.engine import (
    EvidenceError, coverage, creative_director, edit_handoff, post_mortem,
    percentile80, snapshot, three_second_windows, trial_review, verify_variant,
)
from content_intelligence.learning import learning_session


def moment(day, hour=12):
    return datetime(2026, 10, day, hour, tzinfo=timezone.utc).isoformat()


def video(variant_id="a", complete=True):
    v = {
        "variant_id": variant_id, "platform": "instagram", "platform_post_id": "post-" + variant_id,
        "post_url": "https://www.instagram.com/reel/example" + variant_id + "/",
        "post_url_verified": True, "source_file": "media/original.mp4",
        "media_verified": complete, "source_map_verified": complete,
        "published_at": moment(24), "distribution_period": "2026-10",
        "duration_seconds": 10.375,
        "speech": [{"start": 0, "end": 10.375, "text": "Complete verified transcript"}],
        "screens": [{"start": 0, "end": 10.375, "description": "Verified on-screen content"}],
        "time_map": [{"source_start": 2, "source_end": 12.375, "cut_start": 0, "cut_end": 10.375}],
        "observations": [{"collected_at": moment(26), "views": 2000, "saves": 20,
                          "shares": 3, "avg_watch_seconds": 5,
                          "retention": [{"second": 0, "retained": 100}, {"second": 3, "retained": 70},
                                        {"second": 6, "retained": 40}]}],
    }
    if not complete:
        v["screens"][0]["end"] = 10.0
        v["source_map_verified"] = False
    return v


def experiment(complete=True):
    return {"experiment_id": "kk-exp-01", "status": "testing", "objective": "retention",
            "comparison_age_hours": 48, "distribution_period": "2026-10",
            "decision_rule": {"metric": "avg_watch_seconds", "minimum": 5},
            "variants": [video("a", complete), video("b", complete)]}


def archive_video(i, present):
    v = video(str(i))
    v["experiment_id"] = "old-" + str(i)
    v["platform_post_id"] = "hist-" + str(i)
    v["feature_labels"] = [{"feature": "outcome_first", "present": present,
                            "labeled_at": moment(24, 10)}]
    v["observations"][0]["saves"] = 50 if present else 10
    return v


class KairoEngineTests(unittest.TestCase):
    def test_fractional_coverage(self):
        self.assertTrue(verify_variant(video())["complete"])
        bad = verify_variant(video(complete=False))
        self.assertFalse(bad["complete"])
        self.assertIn([10.0, 10.375], bad["coverage"]["screens"]["gaps"])

    def test_retention_no_interpolation(self):
        result = three_second_windows(video()["observations"][0]["retention"], 10.375)
        self.assertEqual(len(result["observed"]), 2)
        self.assertEqual(result["observed"][0]["relative_loss"], .3)
        self.assertIn(1, result["missing_start_seconds"])
        self.assertIn(7, result["missing_start_seconds"])

    def test_paired_snapshot(self):
        v = video()
        paired = snapshot(v, 48)
        self.assertEqual(paired["saves_per_1000_views"], 10.0)
        self.assertEqual(paired["shares"], 3)
        self.assertEqual(paired["post_age_hours"], 48)

    def test_postmortem_promotes_only_verified(self):
        good = post_mortem(experiment(), [], datetime(2026, 10, 29, tzinfo=timezone.utc))
        self.assertEqual(good["next_status"], "reviewed")
        self.assertFalse(good["archive"]["threshold_available"])
        bad = post_mortem(experiment(False), [], datetime(2026, 10, 29, tzinfo=timezone.utc))
        self.assertEqual(bad["next_status"], "testing")

    def test_percentile_continuous(self):
        self.assertAlmostEqual(percentile80([1, 2, 3, 4, 5, 6]), 5.0)
        self.assertAlmostEqual(percentile80([0, 10, 20, 30]), 24.0)

    def test_20_eligible_archive(self):
        rows = [archive_video(i, i % 2 == 0) for i in range(20)]
        result = post_mortem(experiment(), rows, datetime(2026, 10, 29, tzinfo=timezone.utc))
        self.assertTrue(result["archive"]["threshold_available"])
        self.assertEqual(result["archive"]["eligible_count"], 20)
        self.assertIsNotNone(result["archive"]["continuous_p80_saves_per_1000_views"])

    def test_creative_review_no_shortcut(self):
        pitch = {"intended_viewer": "people who use recommendation feeds",
                 "audience_benefit": "learn how ranking signals work",
                 "hook_consequence": "one pause changes an illustrative feed",
                 "hook_prediction": "can you predict next recommended item",
                 "visible_proof": "original labelled simulation", "teachable_payoff": "signals are imperfect",
                 "sources": ["official research"], "ratings": {k: 2 for k in
                 ("hook_clarity", "viewer_relevance", "payoff", "teachability",
                  "personality_humor", "visual_credibility", "platform_measurement")}}
        self.assertTrue(creative_director(pitch)["ready_for_production_review"])
        pitch["misleading_footage"] = True
        self.assertFalse(creative_director(pitch)["ready_for_production_review"])

    def test_edit_handoff_idempotence(self):
        exp = experiment()
        exp["status"] = "reviewed"
        exp["edit_plan"] = [{"variant_id": "a", "action": "CHANGE",
                             "method": "RE-RECORD", "start": 0, "end": 2,
                             "exact_words": "Original example"}]
        exp["descript"] = {"control_composition_id": "first", "test_composition_id": "second"}
        self.assertEqual(edit_handoff(exp), edit_handoff(exp))
        self.assertTrue(edit_handoff(exp)["reuse_existing_compositions"])
        self.assertEqual(len(edit_handoff(exp)["recording_list"]), 1)

    def test_trial_needs_manual_evidence(self):
        exp = experiment()
        exp["status"] = "reviewed"
        exp["min_views"] = 100
        exp["pass_rule"] = {"metric": "saves_per_1000_views", "minimum_lift_fraction": 0.10,
                            "benchmark_minimum": 10.0}
        exp["trials"] = [
            {"role": role, "platform_post_id": role, "url": "https://www.instagram.com/reel/" + role,
             "url_verified": True, "published_at": moment(24),
             "observations": [{"collected_at": moment(26), "views": 200, "saves": 2}]}
            for role in ("control", "test")
        ]
        self.assertEqual(trial_review(exp)["next_status"], "trial")
        exp["status"] = "trial"
        self.assertEqual(trial_review(exp)["next_status"], "trial")
        self.assertEqual(trial_review(exp)["comparison"]["recommended"], "control")
        exp["sharing_decision"] = "share_neither"
        self.assertEqual(trial_review(exp)["next_status"], "closed")

    def test_learning_requires_prelabels_and_independent_runs(self):
        archive = [archive_video(i, i < 8) for i in range(16)]
        lesson = {"lesson_id": "learn-01", "claim": "Outcome-first may improve saves",
                  "status": "hunch", "instrument": {"feature": "outcome_first",
                  "metric": "saves_per_1000_views", "platform": "instagram"}}
        now = datetime(2026, 10, 29, tzinfo=timezone.utc)
        one = learning_session(archive, [lesson], "2026-W44", now)
        self.assertTrue(one["coaching"]["coverage"]["complete"])
        self.assertEqual(one["lessons"][0]["status"], "hunch")
        again = learning_session(archive, one["lessons"], "2026-W44", now)
        self.assertEqual(len(again["lessons"][0]["confirmations"]), 1)
        week2 = learning_session(archive, again["lessons"], "2026-W45", now + timedelta(days=7))
        self.assertEqual(len(week2["lessons"][0]["confirmations"]), 1)
        self.assertEqual(week2["lessons"][0]["status"], "hunch")

    def test_trial_benchmark_is_mandatory_before_posting(self):
        exp = experiment()
        exp["status"] = "reviewed"
        exp["trials"] = [
            {"role": role, "platform_post_id": role, "url": "https://www.instagram.com/reel/" + role,
             "url_verified": True, "published_at": moment(24)}
            for role in ("control", "test")
        ]
        self.assertEqual(trial_review(exp)["next_status"], "reviewed")

    def test_postmortem_aligns_actual_words_and_screens(self):
        report = post_mortem(experiment(), [], datetime(2026, 10, 29, tzinfo=timezone.utc))
        aligned = report["variants"][0]["aligned_windows"]
        self.assertEqual(aligned[0]["speech"][0]["exact_words"], "Complete verified transcript")
        self.assertFalse(aligned[0]["cause_verified"])
        self.assertEqual(aligned[0]["start"], 0)

    def test_sibling_cuts_group_once(self):
        a, b = archive_video(1, True), archive_video(2, False)
        a["experiment_id"] = "sibling"
        b["experiment_id"] = "sibling"
        b["role"] = "control"
        result = learning_session([a, b], [], "2026-W44",
                                  datetime(2026, 10, 29, tzinfo=timezone.utc))
        self.assertEqual(result["coaching"]["coverage"]["total"], 1)
        self.assertEqual(result["coaching"]["manifest"], ["hist-2"])


if __name__ == "__main__":
    unittest.main()
