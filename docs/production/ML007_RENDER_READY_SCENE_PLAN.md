# Micro Learning 007 — Render-ready visual scene and editor handoff

**Target runtime 00:59** · Canvas 1080×1920, 9:16 vertical · 24 FPS · Track: original Fraser `67ceb898-b22f-4e5b-9ab6-ac12f9f9f198` (voice ~58.58s).

## Timeline tracks

- **V1:** cinematic background, graphite-gradient, subtle hex/grid or gradient (original).
- **V2:** simulated app chrome: API STATUS LAB, active user Role: Guest/Viewer, three large request buttons, response panel.
- **V3:** endpoint request packets (App → Server → Response); locked/published visual state and status labels.
- **V4:** callouts, educational definition overlays, recap.
- **A1:** approved Fraser narration, no modification unless QA requires a cut.
- **A2 (optional):** cleared button tap/response chime at low volume. **No extra paid generation.**
- **C1:** separately timed captions, synchronized by listening; not merely word-count interpolation.

## Timecoded edit decisions

| Start | End | Visual state / camera | Exact screen copy | Animation / reveal | Audio alignment |
|---|---|---|---|---|---|
| 00:00 | 00:04 | Graphite HUD and Kairo-branded intro; do not use unverified face | `403 DOESN'T ALWAYS MEAN BROKEN`, `200 · 401 · 403` | 403 count-up/tiny glitch, cyan underline | “Your app makes a request…” |
| 00:04 | 00:08 | Push into original app shell, portrait | `API STATUS LAB`, `SAFE OFFLINE DEMO` | Three buttons stage in one by one | “Watch what happens.” |
| 00:08 | 00:10 | Simulated app: public lesson button highlighted | `ROLE: GUEST`, `View Public Lesson` | Cursor ring/tap ripple | “First, our simulated…” |
| 00:10 | 00:12 | App → Server → App visualization | `GET /lessons/public` | Cyan packet arrow crosses dashed bridge | “requests a public lesson” |
| 00:12 | 00:17 | Successful response, lesson content revealed | `200 OK`, `Request succeeded`, `Lesson: API Basics` | Status pill turns green; reveal check and lesson card | “Two hundred … it worked.” |
| 00:17 | 00:21 | Guest profile and private button tap | `ROLE: GUEST`, `Open Private Lesson` | UI focus to locked lesson | “Next, we try…” |
| 00:21 | 00:24 | Request transport, no login token | `GET /lessons/private` | Amber request packet | “without signing in” |
| 00:24 | 00:29 | Permission panel denied | `401 Unauthorized`, `Sign in required` | Lock icon, amber pulse, no content reveal | “401 … authentication” |
| 00:29 | 00:32 | Change visible user from Guest to Viewer | `ROLE: VIEWER`, `SIGNED IN` | Brief identity-chip change, no real login | “Now we sign in as a viewer” |
| 00:32 | 00:35 | Viewer selects admin-only button | `Publish Admin Post`, `POST /admin/publish` | Tap ripple then request packet | “try an admin-only action” |
| 00:35 | 00:42 | Server denies admin action | `403 Forbidden`, `Viewer cannot publish` | Red response pill, publish button disabled/shakes once | “Four oh three: forbidden.” |
| 00:42 | 00:47 | Two equal explanation cards | `AUTHENTICATION` / `Who are you?` | Left spotlight; icon key | “We have an identity…” |
| 00:47 | 00:51 | Spotlight transitions to right card | `AUTHORIZATION` / `What can you do?` | Right spotlight; access icon | “that's authentication vs authorization” |
| 00:51 | 00:59 | Full-screen save card | `200 — IT WORKED`, `401 — AUTHENTICATE`, `403 — NOT PERMITTED` | Three rows appear in sequence; hold final 2sec | “Save these three codes…” |

### Layout grid
- Preferred desktop canvas 1080×1920; safe central content x=100–980, y=220–1660; bottom 250 px remain uncluttered for platform chrome/captions.
- Technical endpoints in monospaced text >=36 px at final resolution.
- Response label >=75 px and plain-language explanation >=43 px.
- High contrast: background `#08111F`, card `#10263B`, text `#ECF5FB`, accent `#62D5FF`; success `#66E6B8`, authentication warning `#FFD16D`, denied `#FF8295`.
- Show **both request and response** in every example; viewer must never see status number alone.
- All UI is mock; watermark at 00:04-00:42: `SIMULATED / NO NETWORK`.

### Visual QA acceptance tests
1. **200** visibly unlocks and shows actual lesson content.
2. **401** stays in Guest state, shows sign-in requirement, never displays private content.
3. **403** visibly says Signed-in Viewer, action is Admin-only, and no post is published.
4. All three endpoints exactly match `demos/api-status-lab.html`.
5. Authentication/authorization distinction uses two different questions.
6. All seven scene transitions align acceptably to Fraser narration after editorial listen-through.
7. H.264/AAC portrait review export is playable, audio is intelligible, screen type is phone-legible and captions are accurate.
8. Source card references MDN or RFC 9110; no fabricated screenshots, live traffic or external credentials.
9. Original assets only; do not create a new Kairo mask design in the absence of a locked reference.
10. Publish gate remains HOLD until the user reviews the exact updated file.

### Reusable technical implementation

- **Canonical simulated logic:** `demos/api-status-lab.html`
- **Previous four-cut renderer:** `scripts/render_kairo_slate.py`, preserve the other three titles.
- **Standalone ML007 visual renderer:** `scripts/render_ml007_visual.py` (accepts existing voice as input; no additional AI generation/credits).
- Deliver artifacts as new names with suffix `ML007_visual_v2`, retaining the old `kairo_ml007_REVIEW.mp4` as v1.

This is the final approved **production and editor handoff**, not a declaration that the v2 render or its captions passed manual review.
