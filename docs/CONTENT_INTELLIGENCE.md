# Kairo Knox Content Intelligence — implemented pilot

**Scope:** (1) Creative Director, (2) video post-mortems (Prompt #3), (3) controlled edit/trial handoffs (Prompt #4), and (4) weekly evidence learning (Prompt #5). These are the *only* requested agents/capabilities. No TikTok collector, PostgreSQL, browser-login automation, NotebookLM, scheduling, bulk creation, or public publishing.

This repository now contains standard-library Python tooling. It runs from a Mac or Lenovo, or with JSON files made available to an agent. **It does not currently ingest social analytics automatically, manipulate Descript compositions autonomously, or contain original Kairo video media.** Remote connected Metricool data can be exported to the local record contract; do not substitute empty unavailable metrics with zeros.

## Usage

Use Python 3.10+ from the repository root. This program is read-only by default and writes only specified report files. All input files containing media paths, transcripts, experiments, private notes, or analytics should live in ignored local data/; reports/ is ignored too.

    python -m unittest discover -s tests -p 'test_content_intelligence.py' -v
    python -m content_intelligence creative data/pitch.json --out reports/creative.json
    python -m content_intelligence postmortem data/experiment.json --archive data/archive.json --out reports/postmortem.json
    python -m content_intelligence postmortem data/experiment.json --archive data/archive.json --out reports/postmortem.json --write-state
    python -m content_intelligence edit data/experiment.json --out reports/descript-handoff.json
    python -m content_intelligence trial data/experiment.json --out reports/trial.json --write-state
    python -m content_intelligence learn --archive data/archive.json --lessons data/lessons.json --week 2026-W44 --outdir reports --write-lessons

**Persist with care:** --write-state only advances from testing to reviewed when both source/cut maps, media, post IDs, verified post URLs, speech and visual segments cover the entire cut. In a manual trial, it moves reviewed to trial only after both posted variants are verified; trial to closed requires paired, age-comparable metrics, a predeclared pass rule, the minimum view threshold and an actual user decision. Closed experiments remain closed.

**Never** treat edit handoff as a media render: the Descript adapter requires real source media and manually verified project/composition IDs. Composer state is reused when IDs exist. The agent does not publish, distribute, or bypass final approval.

## Data contracts

### Creative Director (preproduction)
Provide a pitch JSON with:
- title, intended_viewer, audience_benefit, hook_consequence, hook_prediction, visible_proof, teachable_payoff, sources (source refs/links).
- ratings: **exactly** hook_clarity, viewer_relevance, payoff, teachability, personality_humor, visual_credibility, platform_measurement; each an explicit integer 0,1,2.
- optional hard stops (Boolean): unsupported_claims, uncleared_rights, misleading_footage, sensitive_data, unsafe_demo.
- If score >= 11/14 with no hard stops and all core fields, pitch is **ready for production review**, **not published or production approved**.
- Humor is optional, factual and natural; Kairo remains the masked identity. Use fresh, human-scale stakes, a concrete demonstration and a worthwhile reveal. Do not copy another creator's distinctive script, voice or footage.

### Experiment and 2 variants
Provide:
- experiment_id, status, objective, decision_rule, comparison_age_hours, min_views, variants (two distinct assigned variant_id values).
- Each variant: variant_id, platform, platform_post_id, post_url, post_url_verified, published_at (ISO offset), distribution_period, source_file, media_verified, source_map_verified, duration_seconds **as exact decimal**.
- speech: [{start,end,text}], screens: [{start,end,description}]. An interval representing silence can have text '[silence]'. Coverage extends through the entire duration including fractional final second.
- time_map: [{source_start,source_end,cut_start,cut_end}], manually verified against actual media; never infer from filenames.
- observations: [{collected_at, views, saves, shares, avg_watch_seconds, retention: [{second,retained}]}]. The saved numbers are from **one observation response**; do not combine saves and views from different timestamps. Unknown is JSON null.
- For retention, percentages use a consistent platform metric; the engine computes every **integer-second-start** 3-second window when both endpoint measurements exist and retained(t)>0. Fractional points are preserved in the input but not interpolated into artificial seconds. Missing anchors appear in missing_start_seconds.
- edit_plan: explicit human-approved edits with variant_id, action KEEP/CHANGE/CUT, method EDIT-ONLY/RE-RECORD, start, end, exact_words, evidence IDs/limitations, success_metric, hypothesis flag.
- descript: {project_id, control_composition_id, test_composition_id, private_project_url} once these exist and are verified. Idempotent rerun reuses them.

Comparison archive: an array of similarly shaped video records; per-post eligibility for #3 requires same platform and distribution_period, published in the preceding 60 days, at least 1,000 *observed* views at comparable age, paired saves and views, and not belonging to the active experiment. At least 20 eligible videos are required for the continuous interpolated 80th percentile; otherwise the threshold is null with an insufficient-archive explanation.

### Learning records
- archive: array of video records with assigned experiment_id, platform_post_id, published_at, observations; optional role=control to select one representative per experiment.
- feature_labels: [{feature,present:true|false,labeled_at}] must be timestamped **before** observed metrics. No retrospective labels counted as independent evidence.
- lessons: [{lesson_id, claim, instrument:{feature,metric,platform,distribution_period}, status, confirmations, history, last_tested_at}].
- Supported measured metrics: saves_per_1000_views, avg_watch_seconds, views, shares. Other retention metrics require trusted source-specific observation fields to be added before analysis.
- Learning requires 8 eligible labeled instances **on each side** for a candidate pattern. It never infers a causal explanation. First support is a hunch; a separate later week and independently new examples can elevate to likely on the second independent confirmation and settled after the third. Re-running the same week cannot count another confirmation. Untested >30 days downgrades confidence; >90 days marks stale until revisited.
- The same experiment is counted only once in group-level learning, defaulting to the assigned control if present. A bounded batch processes all selected records and verifies N/N coverage; unavailable records are explicitly reported.
- Weekly reruns update reports/<week>/coaching.json and evidence.json instead of creating another week or confirmation. Three **property-based** next-test briefs do not write scripts or automatically create experiments.

## Descript connection and actual editing (#4)
Descript is connected through ChatGPT. No Kairo media/project was found during the initial connected-drive search. Therefore this repository prepares an edit handoff and recording list, but cannot claim to have created original/revised compositions, confirmed durations or delivered MP4 files. Once original files are uploaded and a reviewed experiment has a source map, use Descript's Agent Underlord via the connector to create and verify control/test compositions, reusing project and composition IDs in the experiment JSON. Review the compositions privately. Export manually and confirm Instagram Trial Reel eligibility in the account before distributing. Do not publish links or clips without the user's final approval.

Instagram Trial Reel comparisons are **not randomized A/B tests**. Prior to posting, record 48h or another comparable age, min views and pass rule based on your own available observations. After manually posting, record both IDs/URLs and dated metrics, then run trial. No final sharing occurs automatically.

## Human approval boundaries
1. Idea approval is not production approval.
2. Production review confirms verified sources, rights, script and render.
3. Trial-post approval is separate from sharing to all followers.
4. Publication/sharing requires explicit final user approval.
5. Raw login sessions, passwords, cookies, local source media and private identifiers never belong in Github reports or commits.

## What remains incomplete
- No automatic ingest from TikTok, YouTube or Instagram. Native granular retention curves are often unavailable through the current Metricool connection; those fields must remain unknown until retrieved.
- No genuine media timeline validation from Descript yet: current user drive search did not return a Kairo project and actual video files are not attached here.
- No reliable archive with 20+ comparable 1,000-view videos has been established. Post-mortems remain descriptive without that percentile threshold.
- The assistant does not claim retention improvement until we run pilots and compare real metrics.

## Recommended immediate operation
1. Select a future Kairo idea and complete Creative Director pitch fields and ratings.
2. Upload original media and platform-linked analytics/export in a private working location.
3. Run post-mortem once both cut maps and full timestamped timelines are verified.
4. Review an edit-only change and a control in Descript.
5. Compare two manually published trials and feed the dated observations into the next learning week.
