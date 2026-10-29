# Kairo Knox Content Intelligence — selected scope

Implemented: #3 video post-mortem, #5 content learning, #4 private editing/trial handoff, and Kairo Creative Director. Not implemented: prompt #1 PostgreSQL/collector/tracker, prompt #2 TikTok sync, or prompt #6 NotebookLM.

This is a Node 20+ offline, dependency-free analytical application with CLI and unit tests. It never accesses browser sessions, credentials or live accounts, and does not automatically create Descript compositions, export MP4s, schedule or publish. The earlier connected analytics audit identified partial Instagram observations, but NO complete source media, timestamped transcripts, screen coverage, or native retention curves have been supplied to this implementation. It cannot truthfully declare current edit causes or trial winners.

## Commands
Run from repository root. Inputs are private JSON files based on the synthetic examples in tests/core.test.mjs. Keep all inputs and reports within git-ignored .content-agent/ and never store credentials there.

    node --test content-agent/tests/*.test.mjs
    node content-agent/cli.mjs creative .content-agent/pitch.json --out .content-agent/creative.json
    node content-agent/cli.mjs postmortem .content-agent/postmortem.json --out .content-agent/postmortem-report.json
    node content-agent/cli.mjs learn .content-agent/learning.json --out .content-agent/weekly-lessons.json
    node content-agent/cli.mjs trial-prepare .content-agent/trial-prepare.json --out .content-agent/edit-handoff.json
    node content-agent/cli.mjs trial-posts .content-agent/trial-posts.json --out .content-agent/trial-state.json
    node content-agent/cli.mjs trial-observation .content-agent/trial-insight.json --out .content-agent/trial-state.json
    node content-agent/cli.mjs trial-evaluate .content-agent/trial-evaluate.json
    node content-agent/cli.mjs trial-close .content-agent/trial-close.json --out .content-agent/closed.json

The CLI reads a snapshot and writes a new JSON snapshot. Feed the new snapshot into the next call to preserve history. The trial-prepare output includes a trial_state_patch: copy its verified compositions and comparison into the experiment's trial state before using trial-posts. This deliberate handoff requires human review and does not silently mutate an experiment. To avoid duplicate learning confirmations, pass prior saved lesson updates back on reruns. Use explicit now timestamps for reproducible report comparisons. There is no hidden scheduler, database, remote scraper or retained service state.

## #3 post-mortem
Require testing or reviewed experiment with one experiment_id and exactly two assigned variants. Verify original file, source-to-cut map, platform IDs/URLs, full-length timestamped speech and screen coverage (including last fractional second). Never interpolate missing retention seconds. Compute every observed valid three-second relative loss as 1 - retained(t+3)/retained(t) for retained(t)>0. Dedicate distinct reported fields to watch time, saves, shares. Pair every saves/views metric from the SAME dated observation. Separate post ages, collection dates and distribution periods.

Compare eligible independent experiments on same platform and distribution period within 60 days, at least 1000 views, and within the predeclared post-age tolerance. A continuous 80th-percentile saves-per-thousand is issued only with at least 20 independent eligible experiments AND 20 paired saves/view metrics. Otherwise mark insufficient archive. When qualified winner retention data is observed, compare only equivalent observed three-second windows and provide winner reference counts; never fill missing winner windows. Source timestamps and manual exact words required for any KEEP/CHANGE/CUT and EDIT-ONLY/RE-RECORD recommendations; no automatic causal attribution. Recommend reviewed only when both media/maps and full coverage are verified; do not mutate the saved status automatically.

Feature contrasts are descriptive only, need >=8 independent labeled examples per group and reach/recency comparability. A retention dip identifies where viewers left, not why.

## #5 learning
Uses dated per-post observations and manually labeled features timestamped BEFORE measurement. The eligible manifest picks one representative post per experiment, reports excluded/missing inputs, and preserves ID references. Retest instruments are restricted, executable comparators: retention exactly at second 10, average percent viewed, saves per thousand, follows per thousand. Require same platform/distribution period, eight examples on each side, and comparable reach and post age; never assert causality.

Every saved lesson has lesson_id, stable claim, metric/instrument, dated evidence and history, counterexamples where available, confidence/status, last_tested_at. Hunch starts first; later independent weeks with new post IDs may promote after two supporting confirmations to likely, after three to settled. Contradictions weaken; after 30 untested days confidence downgrades; after 90 days becomes stale. Same-week reruns do not add confirmations. Three suggested next test properties are generated without writing scripts or creating new experiment IDs.

## #4 Descript and trial lifecycle
Only reviewed experiments pass the editing stage. Provide control and test composition IDs, original source map IDs, verified duration and transcript coverage. Exact EDIT-ONLY and RE-RECORD notes must include original words and times; generate a short re-record list. If Descript isn't connected or verified, report blockers rather than inventing compositions. Actual transcription, editing and private export require Descript integration and original media.

Before manual Instagram Trial Reel posting, check account eligibility, register comparison age, minimum views and pass rule. Don't claim a controlled A/B experiment. reviewed -> trial requires two distinct user-supplied Instagram Reel URLs and platform IDs; these stay provider-unverified until checked through an authenticated provider. Append observations idempotently by source + post ID + source timestamp and only compare at specified age/minimum views. trial -> closed requires eligible results, actual human decision and timestamp; sharing needs actual shared URL. A new test gets a NEW experiment_id with parent link. Never reopen closed experiments. No video or social publishing action is performed.

## Kairo Creative Director
Seven criteria rated 0-2: immediate hook, human stakes, satisfying payoff, teachability, natural personality/humor, visible credible proof, platform-specific packaging. Two candidate openings: consequence-first and prediction-first. A suggested >=11/14 score is a human editorial review target, not a ranking guarantee. Hard stops cover fabricated claims, unlicensed assets, unsafe demonstration, private data, and publishing without user approval.

## Privacy & publishing gate
CLI output files are private (0600), restricted to .content-agent/, and scrub sensitive credential key names. Do not supply secrets, account cookies or browser sessions in any input. Avoid committing raw analytics/private media. Human stages remain idea approval -> fact and rights verification -> finished playable MP4 and ZIP review -> separate explicit final publishing approval. Passing code tests does NOT prove better audience retention or any video was re-edited.

See docs/RETENTION_REMEDIATION_2026-10-29.md and docs/CREATOR_INSPIRED_PRODUCTION_STANDARD.md for the production approach.
