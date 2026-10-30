# Kairo Knox — Measurement and Controlled Improvements
Version: 2026-10-30.

## Rule: observe first, do not infer an algorithm penalty from a few posts
Posting too often, the wrong audience, weak video openings, format mismatch, recent account connection, content topic and data delays could all contribute to lower views. Do not claim causality from anecdotal before/after comparisons.

## Video reporting per post, per platform
At approximately 24 hours, 48 hours and seven days (when provider data becomes available), record:
- Publish timestamp and platform, series (Core / Micro Learning / Signal Cut), topic, hook type, duration and final asset ID.
- Views, reach or impressions as defined by that platform.
- **Average watch time in seconds**; normalize by video duration for a rough cross-length comparison, but do not treat this as identical to true retention.
- Full-view/complete watch rate where available; first three seconds retention where available.
- **Likes per reach = likes / reach**; **shares per reach = shares / reach**; saves and meaningful comments/replies.
- Instagram shares may be used as a proxy for distribution; the connector may not expose private “sends” separately. Do not call every share a DM send.
- Search/FYP/source breakdown if available; follower growth attributable to post only when actually supported.
- Report unavailable metrics as **N/A**, not zero, and never mix views with reach in a denominator.

## Instagram carousel reporting
For each original carousel, record slide count; cover type; topic; publish timestamp; reach or impressions (which metric); saves, shares, comments and profile actions when available. Compute **save rate = saves / reach** and **share rate = shares / reach** only when a valid reach denominator is available. Record slide progression or dwell data only if the provider actually exposes it; do not invent swipe-through rates. Compare with the **median of similar carousels on the same account at comparable ages**. Mark unavailable data N/A. Evaluate whether a practical checklist, diagram or framework genuinely earns saves, without inferring a causal platform boost.

## Threads reporting per post
Record topic bucket (**Debate Drop** / documentation / practical insight / optional entertainment discussion / occasional video), post date, views, replies, reposts, quotes, likes, profile visits if available, and meaningful follow-up conversations. Prefer **median views and median replies per original text post** over one viral outlier. For debates, distinguish substantive comments and distinct viewpoints from low-effort reactions; note how often a debate creates a promising organic follow-up subject. Track replies written to others separately when possible. Never imply higher views prove a ranking algorithm favored debate.

## Two-week Threads pilot
Hypothesis: original project documentation and **short, good-faith Debate Drops** will be better matched to the existing account audience than repeated video announcements.
1. For two weeks, publish 3–5 original text-led posts weekly using the content mix in PLATFORM_PLAYBOOK.md.
2. Keep the Kairo auto-video crosspost OFF. A thoughtfully introduced clip is allowed only as a separately approved test.
3. Log each post by type; compare Debate Drops against documentation and prior video announcements at comparable post ages; respond to appropriate replies, and record any media or link inclusion.
3a. For debate posts, record the number of substantive replies, relevant alternative viewpoints, and whether the discussion revealed one clear researched follow-up question. Do not confuse heated arguments with healthy engagement.
4. Compare median views and reply rates for the test groups with the previous comparable period, accounting for post age and small sample size.
5. Review qualitative response (relevant questions, constructive discussion, technical credibility) before changing the mix.
6. If data is insufficient, extend the test rather than make definitive claims.
7. When a debate produces a useful follow-up, queue a **proposal** for a text update or occasional evidence-checked short video. No automatic topic-to-video conversion and no publishing without final review.

## Signal Cuts pilot
- Release three distinct clips in spaced slots rather than the same day.
- Record topic, first-two-seconds hook, duration, audience promise, evidence source and the central question.
- After the three clips, assess 48-hour and seven-day performance versus comparably aged Core Episodes and Micro Learning posts.
- Change **one or two** aspects (hook length, subject, clip duration, question style or posting time), not every variable simultaneously.
- Favor audience relevance and substantive saves/shares over vanity counts alone.

## Eight-step Creative Director iteration
Each week, inspect up to the latest 10 posts with usable metrics, grouped by platform and format. Distinguish tested results from creative hypotheses; use per-platform, age-matched median baselines rather than comparing raw numbers across platforms. Log three hypotheses with **one changed primary variable**, a metric and the earliest fair review window. Initial candidates: concrete vs abstract opening (three-second hold/normalized watch), checklist placement (carousel saves per reach), and evidence-led debate questions (substantive replies per view when available). Missing analytics or fewer than 10 posts do not establish failure; report the actual sample size. The workflow in [CREATIVE_DIRECTOR.md](CREATIVE_DIRECTOR.md) defines the full process.

## Weekly 10-minute review ritual
1. Which two videos got the best normalized watch time and helpful interactions?
2. Which post most often led to discussion rather than passive viewing?
3. Which drop-offs occurred early, and was the opening clear?
4. Which captions and subjects attracted the intended audience?
5. What specific creative variable will change next week?
6. Which claims or rights issues need verification before release?

Data may lag or be unavailable in connected tools. Log data provenance and last retrieval date. Never fabricate metrics.
