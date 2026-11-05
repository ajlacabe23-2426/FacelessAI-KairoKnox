# Kairo Knox ML007 Visual v2 — Private Review Receipt
November 4, 2026 · Status: **UPGRADED REVIEW CUT CREATED**, not published, not final picture-lock.

## Editorial decision
User approved a specific visual upgrade: **show real on-screen examples** of `200`, `401`, `403` using an **offline simulated API app**. Keep EP13, EP14, Signal Cut 004 unchanged. Preserve Micro Learning v1 cut.

## Artifacts
- v2 MP4 (Higgsfield confirmed upload): https://d2ol7oe51mr4n9.cloudfront.net/user_3KLAB8V6seR0aGTk7raFFu7JUlM/e841cbf6-b820-4b84-bc60-2e2506f5a5a4.mp4
- Original simulation (interactive in a local browser): `demos/api-status-lab.html`
- Production brief: `docs/production/ML007_VISUAL_PRODUCTION_BRIEF.md`
- Shot-and-edit handoff: `docs/production/ML007_RENDER_READY_SCENE_PLAN.md`
- Reproducible offline renderer: `scripts/render_ml007_visual.py`
- v1 comparison: https://d2ol7oe51mr4n9.cloudfront.net/user_3KLAB8V6seR0aGTk7raFFu7JUlM/a1b0b7f0-050d-427d-83a7-a4b9d57fd08b.mp4

## Actual production
The v2 Python/Pillow renderer created 17 original phone-oriented graphic states covering seven editorial scenes: title intro, three-button app setup, Guest public lesson tap and 200 success, Guest private lesson tap and 401 sign-in lock, signed-in Viewer admin publish tap and 403 rejection, authn/authz split explanation, and recap. All are **fictional graphics**; no real HTTP requests or credentials. The previous **Fraser `seed_audio` track was reused** from generation `67ceb898-b22f-4e5b-9ab6-ac12f9f9f198` (58.58 s). No new paid AI jobs were submitted for v2.

## Technical verification
- File name `Kairo_Knox_ML007_visual_v2_PRIVATE_REVIEW.mp4`
- H.264 720×1280 (portrait); AAC audio.
- ffprobe duration **59.000 seconds**.
- File size **1,490,897 bytes**.
- All 17 scene frames generated; snapshots extracted from 200/401/403 moments without decoding errors.
- File uploaded via presigned URL; HTTP **200**; `media_confirm` returned **uploaded**.
- Original EP13, EP14, Signal Cut 004 review cuts and the four-cut v1 ZIP were not overwritten.
- The record does not claim manual listening, visual legibility on the user's exact phone, or perfect subtitle/audio alignment.

## Outstanding acceptance before public release
- User watches/approves the exact video after reviewing phone readability and timing.
- Narration-to-frame timecodes should be manually aligned; this is a timed first-pass edit, not manually synchronized subtitles.
- Burn accurate captions and conduct cropped-player check for TikTok/YouTube Shorts/Instagram Reels.
- Optionally add the exact locked Kairo appearance to the intro only if existing approved reference assets are confirmed; no replacement character design.
- Publishing approval NOT granted. Social posts/scheduling remain HOLD.

## Why this approach
The visual examples now make the same distinction as the learning objective:
`GET /lessons/public` → success (200);
Guest `GET /lessons/private` → authentication required (401);
Viewer `POST /admin/publish` → permissions denied (403).

**Reference:** MDN HTTP status codes https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status ; RFC 9110 https://www.rfc-editor.org/rfc/rfc9110

