"""Run: python -m content_intelligence --help

No network and no publishing. Input and output are local JSON; sensitive media
and platform credentials must never be committed to the repository.
"""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from .engine import EvidenceError, creative_director, edit_handoff, post_mortem, trial_review
from .learning import learning_session


def load(path, default=None):
    if path is None:
        return default
    with open(path, "r", encoding="utf-8") as source:
        return json.load(source)


def save(path, obj):
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    temp = target.with_name(target.name + ".tmp")
    temp.write_text(json.dumps(obj, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
    temp.replace(target)


def main():
    parser = argparse.ArgumentParser(description="Kairo Knox evidence-first content operations (local only)")
    sub = parser.add_subparsers(dest="command", required=True)
    creative = sub.add_parser("creative", help="Score a pre-production pitch")
    creative.add_argument("pitch")
    creative.add_argument("--out", required=True)
    review = sub.add_parser("postmortem", help="Review two variants and retention with full-coverage gates")
    review.add_argument("experiment")
    review.add_argument("--archive", required=True)
    review.add_argument("--out", required=True)
    review.add_argument("--write-state", action="store_true", help="Persist verified testing -> reviewed")
    edit = sub.add_parser("edit", help="Prepare Descript composition handoff and recording list")
    edit.add_argument("experiment")
    edit.add_argument("--out", required=True)
    trial = sub.add_parser("trial", help="Evaluate manual trial readiness and final sharing decision")
    trial.add_argument("experiment")
    trial.add_argument("--out", required=True)
    trial.add_argument("--write-state", action="store_true", help="Persist only allowable state transitions")
    learn = sub.add_parser("learn", help="Run bounded weekly learning and save separate coaching/evidence")
    learn.add_argument("--archive", required=True)
    learn.add_argument("--lessons", required=True)
    learn.add_argument("--week", required=True, help="ISO week, e.g. 2026-W44")
    learn.add_argument("--outdir", required=True)
    learn.add_argument("--write-lessons", action="store_true")

    args = parser.parse_args()
    if args.command == "creative":
        result = creative_director(load(args.pitch))
        save(args.out, result)
    elif args.command == "postmortem":
        experiment = load(args.experiment)
        result = post_mortem(experiment, load(args.archive, []))
        save(args.out, result)
        if args.write_state and result["next_status"] != experiment.get("status"):
            experiment["status"] = result["next_status"]
            save(args.experiment, experiment)
    elif args.command == "edit":
        save(args.out, edit_handoff(load(args.experiment)))
    elif args.command == "trial":
        experiment = load(args.experiment)
        result = trial_review(experiment)
        save(args.out, result)
        if args.write_state and result["next_status"] != experiment.get("status"):
            experiment["status"] = result["next_status"]
            save(args.experiment, experiment)
    elif args.command == "learn":
        result = learning_session(load(args.archive), load(args.lessons), args.week)
        base = Path(args.outdir) / args.week
        save(base / "coaching.json", result["coaching"])
        save(base / "evidence.json", result["evidence"])
        if args.write_lessons:
            save(args.lessons, result["lessons"])
    print(json.dumps({"command": args.command, "result_written": True}, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except (EvidenceError, KeyError, ValueError, OSError, json.JSONDecodeError) as exc:
        raise SystemExit("Content intelligence could not complete: " + str(exc))
