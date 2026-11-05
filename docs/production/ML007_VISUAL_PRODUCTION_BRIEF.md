# Kairo Knox — Micro Learning 007: One API. Three Responses.

**Production brief v2** · Approved editorial direction, November 4, 2026 · **Private production / no social publishing approval**

## Creative lock

- **Mission:** Teach the distinction between HTTP `200 OK`, `401 Unauthorized`, and `403 Forbidden` through three visible, **simulated** requests, not abstract explanatory title cards.
- **One-line promise:** A beginner can see an app ask for something, observe the server response, and understand *why* the outcome changed.
- **Audience:** beginner developers, IT helpdesk learners, SOC beginners, curious tech viewers. No prerequisite API knowledge.
- **Visual style:** signature Kairo Knox graphite/black, cold cyan accents, clean typography, sharp inset application card. Status color is semantic: 200 green, 401 amber, 403 red. Bold legibility on a phone; avoid tiny pseudo-code.
- **Format:** vertical 9:16, 24/30 FPS, 1080×1920 final target (720×1280 acceptable review). ~59 sec to align with existing Fraser narration. Keep title and key text away from platform controls. Audio should be audible before music/sfx.
- **Kairo:** appearance limited to the already-approved masked analyst asset; if the locked reference is unavailable, use text/logo treatment rather than invent a substitute mask or face. Kairo establishes the narrative; then the demo has the screen.
- **Technical boundary:** no real server calls, no credentials, no actual permission changes, no public API usage. All response payloads are fictional but demonstrate valid HTTP semantics.
- **Approved base narration asset:** Higgsfield Fraser seed-audio generation `67ceb898-b22f-4e5b-9ab6-ac12f9f9f198`, measured duration 58.58 seconds in the earlier review-cut build. Reuse this approved track, not a new paid narration.
- **Previous review cut:** `kairo_ml007_REVIEW.mp4` (59.209s) uses mostly static information cards. Preserve as v1 rather than overwrite. This brief is the **visual upgrade** for v2.

## Audience payoff

The viewer sees a visible, repeatable **Request → Server → Response** interaction for every status and learns:
1. **200 OK:** `GET /lessons/public` works and content appears.
2. **401 Unauthorized:** `GET /lessons/private` while signed out. Server requires valid authentication and the content does not appear. **401 is about authentication**, despite the confusing official reason phrase.
3. **403 Forbidden:** `POST /admin/publish` while signed in as **Viewer**. The identity is known but the account lacks the required privilege. **403 indicates the server refuses to fulfill the request**; insufficient permissions are the case in this example.

**Important accuracy nuance:** 403 does not *always* mean “signed in, but wrong role.” The video shows one typical 403 case. The recap says “not permitted” rather than making a universal claim about every possible 403.

## Locked script (matches the existing voice)

> Your app makes a request to an API. The server sends back a number. Watch what happens. First, our simulated app requests a public lesson. Two hundred, O K. The request worked. Next, we try to open a private lesson without signing in. Four oh one: we need valid authentication. Now we sign in as a viewer, but try an admin-only action. Four oh three: forbidden. We have an identity, but don't have the permission. That's authentication versus authorization in seconds. When a request fails, ask two questions. Did the server recognize who I am? And is that identity allowed to do this? This is a safe, offline demonstration, not a live server. Save these three codes: two hundred, four oh one, four oh three. Which one have you seen in the wild?

## UI interaction contract

All buttons, account state, request and response panels are **illustrations**, not live API calls:
- Public lesson: `Role: Guest` → `GET /lessons/public` → `200 OK` → show sample lesson card.
- Private lesson: `Role: Guest` → `GET /lessons/private` → `401 Unauthorized` → show lock and “Sign in required.”
- Admin publish: `Role: Viewer (signed in)` → `POST /admin/publish` → `403 Forbidden` → show “Viewer cannot publish.”

Use the original local browser demo `demos/api-status-lab.html` as the canonical request/response data reference, ensuring video content and demo behavior match.

## Scene flow

| Scene | Time | Main viewer-visible action | Narration beat | On-screen anchor |
|---|---|---|---|---|
| 01 Hook | 00:00–00:04 | Kairo-branded HUD and big 403 | “Your app makes a request…” | `403 ≠ BROKEN` |
| 02 Setup | 00:04–00:08 | Reveal simulated app with three buttons | “Watch what happens” | `OFFLINE API STATUS LAB` |
| 03 200 | 00:08–00:17 | Tap public lesson → request → 200 → content | “First, our simulated app…” | `200 OK · REQUEST SUCCEEDED` |
| 04 401 | 00:17–00:29 | Guest taps private lesson → request → 401 → sign-in lock | “Next, we try…” | `401 · SIGN IN REQUIRED` |
| 05 403 | 00:29–00:42 | Signed-in viewer taps admin publish → request → 403 | “Now we sign in as a viewer…” | `403 · NOT PERMITTED` |
| 06 Distinction | 00:42–00:51 | Side-by-side Authentication vs Authorization | “That's authentication…” | `WHO ARE YOU? / WHAT CAN YOU DO?` |
| 07 Save card | 00:51–00:59 | Three color-coded response rows; viewer question | “Save these three codes…” | `200 / 401 / 403` |

**Editor instruction:** timings are the intended *visual cue sheet*. Align cuts and actual captions to the existing narration waveform by listening; do not claim they have been manually conformed until verified.

## Production assets and deliverables

Required:
- Original 9:16 illustrated simulated app (button pressed → request arrow → response), strong type, role badges and semantic status colors.
- Existing Fraser narration, optional original/cleared soft UI bleeps; no unlicensed music.
- v2 review MP4 + matching SRT, seven-scene still reference sheet, code-based reproducible renderer, optional separate thumbnail.
- Original working offline demo from `demos/api-status-lab.html`, clearly labeled as such.
- QA: duration, codec, portrait size, playable start/middle/end, status semantics, role consistency, subtitle timing accuracy and safe-area crop.
- **No posting or scheduling** without explicit human approval after final QA.

## Source

- MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- RFC 9110 (HTTP Semantics): https://www.rfc-editor.org/rfc/rfc9110

## Editorial release gates

Draft script ✓ · Source semantics ✓ · Visual plan ✓ · UI sample ✓ · Actual v2 visual render pending QA · Final captions pending review · Final publishing approval **NOT GRANTED**.

Other titles (EP13, EP14, Signal Cut 004) remain unchanged by this Micro Learning-only revision.
