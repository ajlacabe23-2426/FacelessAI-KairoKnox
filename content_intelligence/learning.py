"""Evidence-first learning over prior Kairo post snapshots.

Does not invent features, metrics, causal mechanisms or script lines.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta, timezone
from statistics import median
from .engine import parse_time, snapshot, EvidenceError

SUPPORTED = {"saves_per_1000_views", "avg_watch_seconds", "views", "shares"}


def observed_video(video, comparison_age_hours):
    if not video.get("platform_post_id") or not video.get("published_at"):
        return {"eligible": False, "reason": "missing assigned ID or date"}
    try:
        measurement = snapshot(video, comparison_age_hours)
    except (EvidenceError, KeyError) as exc:
        return {"eligible": False, "reason": str(exc)}
    if not measurement["available"]:
        return {"eligible": False, "reason": measurement["reason"]}
    return {"eligible": True, "measurement": measurement}


def instrument_test(lesson, videos, comparison_age_hours):
    """Instrument cannot be promoted unless observations and pre-metric feature labels exist."""
    instrument = lesson.get("instrument") or {}
    feature = instrument.get("feature")
    metric = instrument.get("metric")
    if not feature or metric not in SUPPORTED:
        return {"valid": False, "reason": "Instrument requires feature and supported metric"}
    positive, negative, unknown = [], [], []
    for video in videos:
        if instrument.get("platform") and video.get("platform") != instrument["platform"]:
            continue
        if instrument.get("distribution_period") and video.get("distribution_period") != instrument["distribution_period"]:
            continue
        observed = observed_video(video, comparison_age_hours)
        if not observed["eligible"]:
            unknown.append({"id": video.get("platform_post_id"), "reason": observed["reason"]})
            continue
        snap = observed["measurement"]
        value = snap.get(metric)
        labels = video.get("feature_labels", [])
        chosen = [l for l in labels if l.get("feature") == feature]
        # Label must have existed before metrics could be inspected.
        if not chosen or value is None:
            unknown.append({"id": video["platform_post_id"], "reason": "feature/metric unavailable"})
            continue
        label = chosen[-1]
        try:
            if parse_time(label["labeled_at"]) >= parse_time(snap["collected_at"]):
                unknown.append({"id": video["platform_post_id"], "reason": "feature labelled too late"})
                continue
        except (EvidenceError, KeyError):
            unknown.append({"id": video["platform_post_id"], "reason": "unverified label date"})
            continue
        sample = {"id": video["platform_post_id"], "value": value,
                  "collected_at": snap["collected_at"], "platform": video.get("platform"),
                  "distribution_period": video.get("distribution_period")}
        if label.get("present") is True:
            positive.append(sample)
        elif label.get("present") is False:
            negative.append(sample)
        else:
            unknown.append({"id": video["platform_post_id"], "reason": "label not Boolean"})
    valid = len(positive) >= 8 and len(negative) >= 8
    return {"valid": valid, "reason": None if valid else "Insufficient comparable labelled examples: need eight per side",
            "feature": feature, "metric": metric,
            "present": positive, "absent": negative, "unknown": unknown,
            "median_present": median([x["value"] for x in positive]) if positive else None,
            "median_absent": median([x["value"] for x in negative]) if negative else None,
            "causal_claim_supported": False}


def _distinct_by_experiment(videos):
    """Keep one observation per experiment group for high-level learning; no sibling-cut double count."""
    groups = {}
    for video in videos:
        key = video.get("experiment_id") or ("ungrouped:" + str(video.get("platform_post_id")))
        if key not in groups:
            groups[key] = video
        else:
            # Favor an explicitly identified control; do not choose using performance.
            if video.get("role") == "control" and groups[key].get("role") != "control":
                groups[key] = video
    return list(groups.values())


def learning_session(archive, lessons, week, now=None, comparison_age_hours=48, batch_size=25):
    now = now or datetime.now(timezone.utc)
    if not (1 <= batch_size <= 100):
        raise EvidenceError("batch_size must be 1..100")
    if not isinstance(archive, list) or not isinstance(lessons, list):
        raise EvidenceError("archive and lessons must be lists")
    grouped = _distinct_by_experiment(archive)
    manifest = [v.get("platform_post_id") for v in grouped]
    processed = []
    for start in range(0, len(grouped), batch_size):
        batch = grouped[start:start + batch_size]
        for v in batch:
            obs = observed_video(v, comparison_age_hours)
            processed.append({"post_id": v.get("platform_post_id"),
                              "experiment_id": v.get("experiment_id"), **obs})
    if len(processed) != len(manifest):
        raise EvidenceError("Manifest processing incomplete")
    lessons_out, findings = [], []
    for original in lessons:
        lesson = deepcopy(original)
        if not lesson.get("lesson_id") or not lesson.get("claim") or not lesson.get("instrument"):
            raise EvidenceError("Lesson requires assigned ID, claim and executable instrument")
        prior = lesson.get("last_tested_at")
        if prior:
            age = (now - parse_time(prior)).days
            if age >= 90:
                lesson["status"] = "stale"
            elif age >= 30 and lesson.get("status") in ("settled", "likely"):
                lesson["status"] = "hunch"
                lesson["confidence_note"] = "Downgraded after 30 days without testing"
        test = instrument_test(lesson, grouped, comparison_age_hours)
        lesson["last_tested_at"] = now.isoformat()
        lesson.setdefault("history", [])
        lesson["history"] = [h for h in lesson["history"] if h.get("week") != week]
        lesson["history"].append({"week": week, "tested_at": now.isoformat(), "result": test})
        # A later run may confirm only on independently new, eligible, labelled posts.
        prior_confirmations = lesson.get("confirmations", [])
        already = {p for c in prior_confirmations for p in c.get("post_ids", [])}
        fresh = {x["id"] for x in test.get("present", []) + test.get("absent", [])} - already
        this_week_confirmed = any(c.get("week") == week for c in prior_confirmations)
        if test["valid"] and not this_week_confirmed and len(fresh) >= 2:
            if test["median_present"] > test["median_absent"]:
                confirmations = prior_confirmations + [{"week": week, "post_ids": sorted(fresh),
                                                        "tested_at": now.isoformat()}]
                lesson["confirmations"] = confirmations
                lesson["status"] = "settled" if len(confirmations) >= 3 else "likely" if len(confirmations) >= 2 else "hunch"
            elif test["median_present"] <= test["median_absent"] and prior_confirmations:
                lesson["status"] = "weakened"
                lesson["confidence_note"] = "New counterexamples contradict the expected direction"
        # Never fabricate confirmations when the archive is too small or labels are late.
        if not test["valid"] and lesson.get("status") not in ("weakened", "refuted", "stale"):
            lesson["status"] = "hunch"
        findings.append({"lesson_id": lesson["lesson_id"], "claim": lesson["claim"],
                         "status": lesson.get("status", "hunch"), "test": test,
                         "confirmations": len(lesson.get("confirmations", []))})
        lessons_out.append(lesson)
    processed_ids = {p["post_id"] for p in processed}
    coverage = {"total": len(manifest), "processed": len(processed), "complete": len(processed) == len(manifest),
                "unavailable": [p for p in processed if not p["eligible"]]}
    # This gives properties to test, never voiceover scripts.
    briefs = [
        {"property": "Show a concrete outcome before introducing the technology",
         "fixed": "Topic, total length, visual source and distribution window",
         "metric": "first-10-second retention when natively available; else average percentage watched",
         "evidence": "Creative hypothesis; not a causal finding"},
        {"property": "Reveal a safe practical demonstration before a long abstract explanation",
         "fixed": "Narration meaning, post age, platform and audience",
         "metric": "average watch seconds and relevant saves per 1000 paired views",
         "evidence": "Creative hypothesis; requires paired observations"},
        {"property": "Use one natural, relevant humor beat rather than generic narration",
         "fixed": "Subject, demonstration, call to action and approximate runtime",
         "metric": "median normalized watch time and substantive replies",
         "evidence": "Creative hypothesis; do not assume humor causes retention"},
    ]
    coaching = {"week": week, "manifest": manifest, "coverage": coverage,
                "lessons": [{"lesson_id": f["lesson_id"], "claim": f["claim"],
                             "status": f["status"], "confirmations": f["confirmations"],
                             "reason": f["test"].get("reason")} for f in findings],
                "next_test_briefs": briefs,
                "notes": ["No scripts generated", "Distinct experiment groups prevent sibling-cut double count",
                          "Group patterns never prove what caused one video's retention"]}
    evidence = {"week": week, "manifest": manifest, "coverage": coverage,
                "processed": processed, "findings": findings,
                "measurement_age_hours": comparison_age_hours}
    return {"coaching": coaching, "evidence": evidence, "lessons": lessons_out}
