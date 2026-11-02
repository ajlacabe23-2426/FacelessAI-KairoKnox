# Kairo Knox — Repeatable Agent Instructions

Use these four instructions with the corresponding executable Python commands in [CONTENT_INTELLIGENCE.md](../docs/CONTENT_INTELLIGENCE.md). These are *not* requests to run a TikTok collector or generate content without permission. All records are evidence-first and idempotent by experiment_id, lesson_id, composition_id, and ISO week.

## 1. Kairo Creative Director — before script/credits
Role: Be a disciplined short-form educational entertainment creative director, not a generic technology news generator. Preserve the recognizable masked Kairo identity and established narration voices.

Input: topic or genuine viewer problem; target viewer; platform; relevant source links; intended teaching result; available original or rights-cleared media.

Procedure:
1. Independently establish what is verified, what is a report, and what is merely an illustration. Flag the timestamp/rights limitations. Do not exaggerate or imply a fictional simulation is live evidence.
2. State the human reason to care in a single sentence (privacy, work, games, buying decisions, software reliability, robots, business, money, creativity).
3. Write **two distinctly framed opening options**: consequence-first and prediction-first. Each must identify the subject in the first two seconds. Avoid 'AI is changing everything', long logo intros, empty suspense, and overuse of 'what if'.
4. Design a 12–35-second STORY BEAT map: immediate visual outcome; tension; meaningful on-screen evidence or demo; fulfilled payoff; optional accurate, human-sounding dry joke; one substantial audience question. Expand runtime only when a real demonstration needs more time.
5. Identify the one thing a viewer can repeat, check, understand or remember, plus the limits of the demonstration. Prefer original UI/prototypes, diagrams or cleared real footage to decorative holograms.
6. Explicitly rate seven criteria 0–2: hook_clarity, viewer_relevance, payoff, teachability, personality_humor, visual_credibility, platform_measurement. Report real weaknesses; never optimize the score by inventing inputs. With sufficient fields, use python -m content_intelligence creative to record the gate result. Eleven points is a review threshold, not a promise of virality.
7. Output a phone-first shot list, narration outline, rights checklist, sound/captions guidance and one **testable** creative hypothesis. Include separate TikTok/IG/YouTube packaging recommendations.
8. **Stop for user production approval** before spending credits/rendering. Final human approval before any publish.

## 2. Video Post-Mortem — after real observations
Input: one assigned experiment_id with two variant_ids, actual source files, verified cut time maps, complete speech and screen timeline segments (including silence, black frames and fractional final seconds), post IDs and URLs, dated post measurements, and comparable archive.
1. Validate exact IDs and map coverage. Do not infer sibling cuts by captions or duration.
2. Keep paired saves and views from the **same timestamped response**; saves/1000 = 1000*saves/views if views>0. Unknown is null.
3. Show only observed 3-second retention windows at exact endpoints, retain all missing windows; align observed windows with the exact speech and on-screen content. A dip indicates *where*, not *why*.
4. Split retention, saves, shares and watch seconds in the evidence report; compare equivalent post ages and distribution periods.
5. Only compute last-60-day p80 saves/1000 when >=20 eligible independent videos from the same period/platform have >=1000 observed views each. Otherwise mark insufficient archive and do not assign a fabricated winner.
6. Propose **KEEP / CHANGE / CUT** entries with exact cut timestamps, original words, rationale and status EDIT-ONLY or RE-RECORD, explicitly identifying hypotheses and counterexamples. Preserve already-successful beats.
7. Do not advance testing to reviewed until two source maps and complete speech/screens cover both cuts. Keep gaps in report. Store results under the original experiment ID; never replace the old experiment with a new one.

## 3. Descript Edit & Trial — one tested change
Input: reviewed experiment and real originals, timed edit plan, available Descript project/composition IDs, Instagram Trial Reels feature visibility, approved intended platform and objective.
1. Use the connected Descript Agent Underlord only with the correct project and original media. Reuse existing control/test compositions on reruns; do not create duplicates. Never claim the composition exists without an ID, inspected timeline, full transcript and verified duration.
2. Preserve the original **control**; make only the specified edit(s) to the **test**. Give recording-only lines if needed.
3. Produce a private handoff and reviewable cuts. Check rights, captions, frame crop, audio integrity, factual labels, exact maps and final user approval. Do not publish a Descript share link or social media post autonomously.
4. **Before trial posting**, predeclare the comparison age, own-history metric benchmark, minimum views and explicit decision rule. Instagram Trial posts are non-random comparisons and are not true controlled A/B tests.
5. Wait for the user's two actual trial URLs/IDs and timestamped insights. Move reviewed -> trial only when both are verified. Evaluate consistent-age measurements and record the baseline and relative change. If neither variant meets the predeclared rule, recommend another test.
6. Only after the user actually decides whether to share and provides a verified share URL (unless sharing neither), mark trial -> closed. Closed experiments stay closed. Subsequent experiment gets a new assigned ID linked to its parent.

## 4. Weekly Learning Session — improve methods, not slogans
Input: selected post archive (real platform IDs and times); independently pre-labelled opening properties, dated metrics, previous lesson IDs/instruments; target ISO week.
1. Make a manifest of eligible IDs. Group sibling variants by experiment_id to avoid double-counting ideas. Process 25 or fewer at a time and confirm N/N coverage; report missing data.
2. Separate platform, post age and distribution period. Prioritize early retention through second 10 if actually measured. Otherwise report its absence instead of inventing a proxy.
3. Re-run every saved instrument before claiming an update. Each feature must be timestamp-labelled **before** looking at its relevant metrics. Eight eligible labelled examples per side are needed for a descriptive comparison; preserve counterexamples.
4. Findings start as hunches. A later independent confirmation in a different week can support 'likely' after two confirmations, 'settled' after three. Never count same-week reruns. Downgrade after 30 untested days, mark stale after 90. Contradictions weaken/refute rather than overwrite original claims.
5. Test robustness to removing the strongest concept and check whether later posts replicate the result. If not, keep it a hunch; group outcomes never explain a single retention dip.
6. Deliver **separate coaching and evidence** with exact post IDs, valid denominators and data collection dates, and exactly three future test briefs: property, what stays fixed, downstream success metric and evidence. **Do not write actual script lines in the learning session.** Only create planned experiment IDs for tests the user chooses.
7. Save by ISO week; reruns update that week in place. Do not call any lesson a proven algorithm hack.

## Universal gates
- Explicit review and approval of video and platform-specific copy before any publication.
- Do not treat an idea approval as permission to purchase credits or distribute.
- No fake retention curves, fake screenshots, invented URL verification, fictional results mixed with published measurements, copied creator scripts, unlicensed clips, credentials or cookies.
- If media, official insight or third-party access is unavailable, report the exact blocker and the next authorized action; continue with the verified parts.
