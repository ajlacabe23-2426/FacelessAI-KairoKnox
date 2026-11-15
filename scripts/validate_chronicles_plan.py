"""Structural story plan gate; never a media or artistic inspection."""
import argparse
import json
import re
import sys

ACTS = ("aftermath", "discovery", "confrontation", "aftermath2", "archive")
TEXT_FIELDS = ("location", "purpose", "consequence", "continuity_anchor", "camera", "sound")
RELEASE_FLAGS = ("approved_storyboard", "canon_match", "animatic_pass", "all_shots_reviewed",
                 "full_playback_pass", "rights_pass", "director_approval")

def validate(plan, release=False):
    errors = []
    if not isinstance(plan, dict):
        return ["plan must be an object"]
    shots = plan.get("shots")
    if not isinstance(shots, list) or not shots:
        return ["shots missing"]
    roles = plan.get("roles")
    if not isinstance(roles, dict):
        roles = {}
    for role in ("kairo", "nyra", "vesper", "grid_patrol"):
        entry = roles.get(role)
        if not isinstance(entry, dict) or any(not isinstance(entry.get(k), str) or not entry[k].strip() for k in ("alignment", "visual", "voice")):
            errors.append("role incomplete: " + role)
    if roles.get("vesper", {}).get("alignment") == roles.get("grid_patrol", {}).get("alignment"):
        errors.append("guardian and patrol roles must differ")
    cursor, previous, seen, act_order = 0, None, set(), []
    for shot in shots:
        if not isinstance(shot, dict):
            errors.append("shot must be an object")
            continue
        sid = shot.get("id")
        if not isinstance(sid, str) or not sid or sid in seen:
            errors.append("invalid/duplicate shot ID")
        else:
            seen.add(sid)
        if shot.get("previous_id") != previous:
            errors.append(f"{sid}: broken predecessor")
        start, end = shot.get("start"), shot.get("end")
        if type(start) is not int or type(end) is not int or start != cursor or end <= start:
            errors.append(f"{sid}: non-contiguous or invalid time range")
        else:
            cursor = end
        act = shot.get("act")
        if not act_order or act_order[-1] != act:
            act_order.append(act)
        for field in TEXT_FIELDS:
            if not isinstance(shot.get(field), str) or not shot[field].strip():
                errors.append(f"{sid}: missing {field}")
        if release and (shot.get("review_status") != "accepted" or not isinstance(shot.get("source_asset"), str) or not shot["source_asset"].strip()):
            errors.append(f"{sid}: missing accepted source")
        previous = sid
    if type(plan.get("duration_seconds")) is not int or cursor != plan.get("duration_seconds"):
        errors.append("runtime mismatch")
    if tuple(act_order) != ACTS:
        errors.append("acts missing, repeated or out of order")
    if release:
        gate = plan.get("release")
        if not isinstance(gate, dict):
            return errors + ["release evidence missing"]
        for flag in RELEASE_FLAGS:
            if gate.get(flag) is not True:
                errors.append("release gate not met: " + flag)
        if not isinstance(gate.get("reviewer_receipt"), str) or not gate["reviewer_receipt"].strip():
            errors.append("reviewer receipt missing")
        if not isinstance(gate.get("master_sha256"), str) or not re.fullmatch(r"[0-9a-f]{64}", gate["master_sha256"]):
            errors.append("master checksum missing or invalid")
    return errors

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan")
    parser.add_argument("--release", action="store_true")
    args = parser.parse_args()
    try:
        with open(args.plan, encoding="utf-8") as f:
            errors = validate(json.load(f), args.release)
    except (OSError, ValueError, AttributeError, TypeError) as exc:
        errors = [str(exc)]
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print("Structural checks passed; not proof of human review or publication authorization.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
