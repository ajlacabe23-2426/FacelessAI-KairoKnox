"""Kairo Knox evidence-first creative, post-mortem, learning and trial engine.

Standard-library only; no network, credentials, publishing or automatic media edits.
All analytics are user-supplied observed snapshots, never synthesized.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from math import floor
from statistics import median
from urllib.parse import urlparse


class EvidenceError(ValueError):
    pass


def parse_time(value):
    if not isinstance(value, str):
        raise EvidenceError("An ISO timestamp is required")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise EvidenceError("Invalid ISO timestamp: " + value) from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise EvidenceError("Timestamps must include a timezone: " + value)
    return parsed.astimezone(timezone.utc)


def valid_url(url):
    if not isinstance(url, str):
        return False
    parsed = urlparse(url)
    return parsed.scheme == "https" and bool(parsed.hostname)


def coverage(segments, duration, start_key="start", end_key="end"):
    """Continuous coverage, including a fractional last second. Silence needs a labelled segment."""
    try:
        duration = float(duration)
    except (TypeError, ValueError):
        return {"complete": False, "gaps": ["duration unavailable"]}
    if duration <= 0 or not isinstance(segments, list) or not segments:
        return {"complete": False, "gaps": [[0, duration]]}
    gaps = []
    cursor = 0.0
    for segment in sorted(segments, key=lambda p: float(p[start_key])):
        a, b = float(segment[start_key]), float(segment[end_key])
        if a < -0.000001 or b <= a or b > duration + 0.000001:
            return {"complete": False, "gaps": ["invalid segment bounds"]}
        if a > cursor + 0.000001:
            gaps.append([round(cursor, 6), round(a, 6)])
        cursor = max(cursor, b)
    if cursor < duration - 0.000001:
        gaps.append([round(cursor, 6), round(duration, 6)])
    return {"complete": not gaps, "gaps": gaps}


def verify_variant(variant):
    duration = variant.get("duration_seconds")
    parts = {}
    for key in ("speech", "screens"):
        parts[key] = coverage(variant.get(key, []), duration)
    mapping = coverage(variant.get("time_map", []), duration, "cut_start", "cut_end")
    parts["time_map"] = mapping
    errors = []
    for key, result in parts.items():
        if not result["complete"]:
            errors.append(key + " lacks full coverage: " + str(result["gaps"]))
    if not variant.get("media_verified", False):
        errors.append("original and cut media not verified")
    if not variant.get("source_map_verified", False):
        errors.append("source-to-cut map not verified")
    if not variant.get("source_file"):
        errors.append("source_file missing")
    if not variant.get("variant_id"):
        errors.append("variant_id missing")
    if not variant.get("platform_post_id") or not valid_url(variant.get("post_url")):
        errors.append("verified post ID and HTTPS URL needed")
    if not variant.get("post_url_verified", False):
        errors.append("post URL has not been verified")
    if not variant.get("published_at") or not variant.get("distribution_period"):
        errors.append("publication time and distribution period required")
    return {"complete": not errors, "errors": errors, "coverage": parts}


def three_second_windows(retention, duration):
    """Integer-second anchors only, exact endpoints only: never interpolate missing retention."""
    try:
        duration = float(duration)
    except (TypeError, ValueError):
        return {"observed": [], "missing_start_seconds": []}
    observed = {}
    for point in retention or []:
        t, r = point.get("second"), point.get("retained")
        if isinstance(t, (float, int)) and isinstance(r, (float, int)) and 0 <= r <= 100:
            observed[float(t)] = float(r)
    results, missing = [], []
    for start in range(0, max(0, floor(duration - 3.0) + 1)):
        a, b = observed.get(float(start)), observed.get(float(start + 3))
        if a is None or b is None or a <= 0:
            missing.append(start)
        else:
            results.append({"start": start, "end": start + 3,
                            "relative_loss": round(1 - b / a, 6)})
    return {"observed": results, "missing_start_seconds": missing}


def snapshot(variant, comparison_age_hours, tolerance_hours=None):
    """Only one timestamped response supplies both saves and views."""
    target = float(comparison_age_hours)
    tolerance = max(6.0, target * 0.25) if tolerance_hours is None else float(tolerance_hours)
    if not variant.get("published_at"):
        return {"available": False, "reason": "Published timestamp unavailable"}
    publication = parse_time(variant["published_at"])
    options = []
    for row in variant.get("observations", []):
        captured = parse_time(row["collected_at"])
        age = (captured - publication).total_seconds() / 3600
        if age >= 0:
            options.append((abs(age - target), age, row))
    if not options:
        return {"available": False, "reason": "No dated observations"}
    distance, age, row = min(options, key=lambda p: p[0])
    if distance > tolerance:
        return {"available": False, "reason": "No observation at comparable post age"}
    views, saves = row.get("views"), row.get("saves")
    saves_per_1000 = None
    if isinstance(views, (int, float)) and views > 0 and isinstance(saves, (int, float)) and saves >= 0:
        saves_per_1000 = 1000 * saves / views
    return {"available": True, "collected_at": row["collected_at"], "post_age_hours": round(age, 2),
            "views": views, "saves": saves, "shares": row.get("shares"),
            "avg_watch_seconds": row.get("avg_watch_seconds"),
            "saves_per_1000_views": saves_per_1000,
            "retention": row.get("retention")}


def percentile80(values):
    """Continuous linear-interpolated 80th percentile (type 7 / numpy default)."""
    if not values:
        return None
    values = sorted(values)
    x = (len(values) - 1) * 0.8
    low, high = floor(x), min(len(values) - 1, floor(x) + 1)
    return values[low] + (x - low) * (values[high] - values[low])


def eligible_archive(archive, experiment, now):
    """Comparable platform/period, last 60 days, minimum 1000 observed views."""
    cutoff = now - timedelta(days=60)
    platform = {v["platform"] for v in experiment.get("variants", [])}
    period = {v.get("distribution_period") for v in experiment.get("variants", [])}
    rows = []
    for video in archive:
        if video.get("experiment_id") == experiment.get("experiment_id"):
            continue
        if video.get("platform") not in platform or video.get("distribution_period") not in period:
            continue
        try:
            date = parse_time(video["published_at"])
        except (EvidenceError, KeyError):
            continue
        if not cutoff <= date <= now:
            continue
        obs = snapshot(video, experiment.get("comparison_age_hours", 48))
        if obs["available"] and isinstance(obs["views"], (int, float)) and obs["views"] >= 1000:
            if obs["saves_per_1000_views"] is not None:
                rows.append({"platform_post_id": video.get("platform_post_id"),
                             "saves_per_1000_views": obs["saves_per_1000_views"],
                             "retention": obs["retention"], "comparison": obs})
    return rows


def post_mortem(experiment, archive, now=None):
    now = now or datetime.now(timezone.utc)
    exp_id = experiment.get("experiment_id")
    if not exp_id:
        raise EvidenceError("experiment_id must be assigned")
    variants = experiment.get("variants", [])
    if len(variants) != 2 or len({v.get("variant_id") for v in variants}) != 2:
        raise EvidenceError("Exactly two distinct assigned variant IDs are required")
    if experiment.get("status") == "closed":
        raise EvidenceError("Closed experiments must not be reviewed again")
    result = {"experiment_id": exp_id, "status_before": experiment.get("status"),
              "objective": experiment.get("objective"), "decision_rule": experiment.get("decision_rule"),
              "variants": [], "limitations": [], "archive": {}, "next_status": experiment.get("status")}
    for variant in variants:
        checked = verify_variant(variant)
        measurement = snapshot(variant, experiment.get("comparison_age_hours", 48))
        retention = measurement.get("retention") or []
        windows = three_second_windows(retention, variant.get("duration_seconds"))
        aligned = []
        for window in windows["observed"]:
            start, end = window["start"], window["end"]
            speech = [{"start": seg["start"], "end": seg["end"], "exact_words": seg.get("text")}
                      for seg in variant.get("speech", [])
                      if float(seg["start"]) < end and float(seg["end"]) > start]
            screens = [{"start": seg["start"], "end": seg["end"], "description": seg.get("description")}
                       for seg in variant.get("screens", [])
                       if float(seg["start"]) < end and float(seg["end"]) > start]
            aligned.append({"start": start, "end": end, "relative_loss": window["relative_loss"],
                            "speech": speech, "screens": screens,
                            "cause_verified": False, "review_action": "HYPOTHESIS ONLY"})
        result["variants"].append({"variant_id": variant["variant_id"],
                                    "platform_post_id": variant.get("platform_post_id"),
                                    "verification": checked, "measurement": measurement,
                                    "three_second_windows": windows,
                                    "aligned_windows": aligned,
                                    "edit_plan": variant.get("edit_plan", [])})
        if not checked["complete"]:
            result["limitations"].append(variant["variant_id"] + ": " + "; ".join(checked["errors"]))
        if not measurement["available"]:
            result["limitations"].append(variant["variant_id"] + ": " + measurement["reason"])
        if windows["missing_start_seconds"]:
            result["limitations"].append(variant["variant_id"] + ": missing retention windows are unknown")
    eligible = eligible_archive(archive, experiment, now)
    result["archive"] = {
        "eligible_count": len(eligible),
        "threshold_available": len(eligible) >= 20,
        "continuous_p80_saves_per_1000_views": percentile80(
            [v["saves_per_1000_views"] for v in eligible]) if len(eligible) >= 20 else None,
        "eligible_post_ids": [v["platform_post_id"] for v in eligible],
    }
    if len(eligible) < 20:
        result["limitations"].append("Insufficient comparable archive: requires 20 eligible 1000+ view videos")
    if all(v["verification"]["complete"] for v in result["variants"]) and experiment.get("status") == "testing":
        result["next_status"] = "reviewed"
    return result


CREATIVE_CATEGORIES = (
    "hook_clarity", "viewer_relevance", "payoff", "teachability",
    "personality_humor", "visual_credibility", "platform_measurement"
)


def creative_director(pitch):
    """No fake AI scoring: a human or reviewer must supply seven bounded ratings."""
    ratings = pitch.get("ratings", {})
    if set(ratings) != set(CREATIVE_CATEGORIES) or any(type(ratings[k]) is not int or ratings[k] not in (0, 1, 2) for k in CREATIVE_CATEGORIES):
        raise EvidenceError("Supply exactly seven explicit 0/1/2 creative ratings")
    mandatory = ("intended_viewer", "audience_benefit", "hook_consequence",
                 "hook_prediction", "visible_proof", "teachable_payoff", "sources")
    absent = [k for k in mandatory if not pitch.get(k)]
    hard_stops = [name for name in ("unsupported_claims", "uncleared_rights",
                 "misleading_footage", "sensitive_data", "unsafe_demo") if pitch.get(name, False)]
    score = sum(ratings.values())
    return {"title": pitch.get("title"), "score": score, "out_of": 14,
            "ready_for_production_review": score >= 11 and not absent and not hard_stops,
            "missing": absent, "hard_stops": hard_stops,
            "next": "Review two openings, script and rights; final human approval required before publishing"}


def edit_handoff(experiment):
    """Creates a safe edit checklist; does not invent compositions or publish anything."""
    if experiment.get("status") not in ("reviewed", "trial"):
        raise EvidenceError("Experiment must be reviewed before edit handoff")
    plan = experiment.get("edit_plan", [])
    for edit in plan:
        if edit.get("action") not in ("KEEP", "CHANGE", "CUT"):
            raise EvidenceError("Edit action must be KEEP, CHANGE or CUT")
        if edit.get("method") not in ("EDIT-ONLY", "RE-RECORD"):
            raise EvidenceError("Edit method must be EDIT-ONLY or RE-RECORD")
        if "start" not in edit or "end" not in edit or not edit.get("variant_id"):
            raise EvidenceError("Each edit needs variant ID and exact timestamps")
    compositions = experiment.get("descript", {})
    return {"experiment_id": experiment["experiment_id"], "control_composition_id": compositions.get("control_composition_id"),
            "test_composition_id": compositions.get("test_composition_id"),
            "reuse_existing_compositions": bool(compositions.get("control_composition_id") and compositions.get("test_composition_id")),
            "edit_plan": plan,
            "recording_list": [e for e in plan if e["method"] == "RE-RECORD" and e["action"] != "KEEP"],
            "requires_user_review": True, "publish_automatically": False}


def trial_review(experiment):
    """Trial transitions need user-verified URLs and explicit manual sharing decision."""
    status = experiment.get("status")
    if status not in ("reviewed", "trial", "closed"):
        raise EvidenceError("Trial is available only after reviewed")
    trials = experiment.get("trials", [])
    if len(trials) != 2 or {t.get("role") for t in trials} != {"control", "test"}:
        return {"next_status": status, "reason": "Two control/test trial records required"}
    for entry in trials:
        if not entry.get("platform_post_id") or not valid_url(entry.get("url")) or not entry.get("url_verified") or not entry.get("published_at"):
            return {"next_status": status, "reason": "Both manually posted trial URLs and platform IDs require verification"}
    if status == "reviewed":
        rule = experiment.get("pass_rule") or {}
        if (experiment.get("min_views") is None or experiment.get("comparison_age_hours") is None
                or rule.get("metric") not in ("saves_per_1000_views", "avg_watch_seconds", "shares")
                or not isinstance(rule.get("benchmark_minimum"), (int, float))):
            return {"next_status": "reviewed", "reason": "Predeclare comparison age, minimum views and own-history pass rule before trial posts"}
        return {"next_status": "trial", "reason": "Both trial posts verified; awaiting comparable metrics"}
    if status == "closed":
        return {"next_status": "closed", "reason": "Immutable closed experiment"}
    checks = [snapshot({"published_at": t["published_at"], "observations": t.get("observations", [])},
                       experiment.get("comparison_age_hours", 48)) for t in trials]
    min_views = experiment.get("min_views")
    rule = experiment.get("pass_rule") or {}
    allowed = ("saves_per_1000_views", "avg_watch_seconds", "shares")
    metric, benchmark = rule.get("metric"), rule.get("benchmark_minimum")
    lift = rule.get("minimum_lift_fraction", 0.0)
    if (min_views is None or metric not in allowed or not isinstance(benchmark, (float, int))
            or not isinstance(lift, (float, int)) or lift < 0 or benchmark < 0):
        return {"next_status": "trial", "reason": "Predeclared min_views, metric, own-history benchmark_minimum and valid lift required"}
    if any(not c["available"] or c["views"] is None or c["views"] < min_views for c in checks):
        return {"next_status": "trial", "reason": "Comparable trial observations not yet sufficient", "observations": checks}
    control, test = checks
    a, b = control.get(metric), test.get(metric)
    if a is None or b is None:
        return {"next_status": "trial", "reason": "Chosen metric unavailable for one or both trials", "observations": checks}
    control_passes, test_passes = a >= benchmark, b >= benchmark
    test_beats_control = b >= a * (1 + lift) and b > a
    winner = "test" if test_passes and test_beats_control else "control" if control_passes else "neither"
    recommendation = ("Consider sharing the " + winner + " trial after human review"
                      if winner != "neither" else "Neither passes; recommend a new experiment")
    comparison = {"metric": metric, "benchmark_minimum": benchmark,
                  "minimum_lift_fraction": lift, "control": a, "test": b,
                  "recommended": winner, "recommendation": recommendation,
                  "not_controlled_ab_test": True}
    if experiment.get("sharing_decision") not in ("share_control", "share_test", "share_neither"):
        return {"next_status": "trial", "reason": "Waiting for user's actual sharing decision",
                "observations": checks, "comparison": comparison}
    if experiment["sharing_decision"] != "share_neither" and not valid_url(experiment.get("shared_url")):
        return {"next_status": "trial", "reason": "Verified shared URL required",
                "observations": checks, "comparison": comparison}
    if experiment["sharing_decision"] != "share_neither" and not experiment.get("shared_url_verified"):
        return {"next_status": "trial", "reason": "Shared URL has not been verified",
                "observations": checks, "comparison": comparison}
    return {"next_status": "closed", "reason": "User decision recorded; do not select closed experiment again",
            "observations": checks, "comparison": comparison,
            "sharing_decision": experiment["sharing_decision"]}
