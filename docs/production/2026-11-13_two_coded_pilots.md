# 2026-11-13 — two code-first review episodes

Status: **TWO PRIVATE REVIEW MP4s RENDERED AND MEDIA-VALIDATED / CREATIVE REVIEW PENDING / NOT APPROVED / NOT PUBLISHED**.

## Scope
Two **separate** 30-second 1080×1920 Remotion compositions, with low-cost original graphics, GSAP deterministic timeline transitions, original narrative and a temporary open-weight synthesized voice (Kokoro-82M, Apache-2.0 model), and a sparse fully original synthesized ambience bed. GitHub review job renders at 0.75 scale (810×1440), 30 fps to control testing cost; a final native-resolution acceptance render is required.

- `MicroLearningPilot` — **How an app gets data**. Four scenes: 0–5 hook; 5–14.5 request; 14.5–23 response; 23–30 takeaway. Correct educational distinction: a simplified illustrative HTTP request/response; not a packet trace or real API.
- `SignalCutPilot` — **Your feed is a prediction**. Four scenes: 0–5 hook; 5–13.5 illustrative watch-time/like/share signals; 13.5–22 feedback loop; 22–30 critical takeaway. This is **not** a documented internal model of a platform; only a concept illustration, and platform models vary.

## Factual source ledger
- HTTP overview: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview — client requests, server responses, status and representation.
- TikTok recommendation factors: https://support.tiktok.com/en/using-tiktok/exploring-videos/how-tiktok-recommends-content — watch time, shares, likes and other interaction signals can influence recommendations.
- YouTube recommendation overview: https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/ — clicks, watch time, surveys, likes/shares can be signals; ranking is more complex than any simple diagram.

## Creative & production gates
1. Keep educational claims accurate, show actual moving diagrams rather than slide zooms; all UI cards and logos original (no third-party raw screenshots).
2. No paid media generation used. GitHub compute and package/model downloads still have resource costs; do not assume $0 infrastructure or commercial voice certification.
3. Temporary `am_michael` TTS voice is **not** an approved branded narrator or an impersonation of Ainsley; use it only for internal quality testing. The model has a separate Apache-2.0 license; retain attribution and review any other dependencies.
4. The review workflow must pass TypeScript, render both complete MP4s, and verify a 30s H.264 video and an audio stream. Human must visually inspect motion, legibility, audio mix, timing and truthfulness. CI success is **not** a quality pass.
5. Neither editorial approval, paid generation, permission to publish, nor social posting is inferred by this test. Keep releases blocked until user watches both final cuts and approves each destination.

## Output location
GitHub Actions review artifacts from `.github/workflows/episode-review-renders.yml`, not the repository's public source tree. The artifacts expire after seven days. Audio files and MP4 binaries are intentionally ignored by Git and are not published.

## Actual technical acceptance receipt (2026-11-13)
- [GitHub Actions review run #43443767398](https://github.com/ajlacabe23-2426/FacelessAI-KairoKnox/actions/runs/43443767398) **completed SUCCESS**. Job installed pinned video dependencies, passed TypeScript, generated Kokoro voice tracks, rendered both full 30-second videos, validated them with FFprobe and uploaded artifact **#14047138116** (`kairo-coded-episode-review-cuts`).
- Micro Learning output: **H.264 / 810×1440 / 30 fps / AAC audio / 30.016 s / 2,058,914 bytes**.
- Signal Cut output: **H.264 / 810×1440 / 30 fps / AAC audio / 30.016 s / 1,961,881 bytes**.
- Two exported MP4s were retrieved and independently checked for full decode and audio: no ffmpeg decoding error; non-silent RMS approximately 0.024 each, zero samples above 0.99 after PCM decode.
- Representative 12-frame sheets were inspected per video: correct general sequence, original dark-blue and purple visual styles, animated titles/diagram changes; however mobile labels are small and several scenes remain comparatively static. **Creative-quality acceptance is pending**, including user review, natural narration pacing, and exact subtitle timing.
- Render-scale was 75% of the 1080x1920 source for the affordable pilot. This output is **not** a native-resolution release master. No social uploads, paid generation calls, publishing or branch merges performed.

## Native 1080 release-QA follow-up (2026-11-13)
- [Native review run #43487886331](https://github.com/ajlacabe23-2426/FacelessAI-KairoKnox/actions/runs/43487886331): SUCCESS; artifact #14069455415 (`kairo-coded-episode-review-cuts`). Both MP4s are **1080×1920, H.264/AAC, 30 fps, 30.016 s**, independently FFprobe-verified and decoded in the review runtime. [Source head `936eea39`](https://github.com/ajlacabe23-2426/FacelessAI-KairoKnox/commit/936eea39c86d38ec7e07bec029c505de96214094).
- [Visual smoke run #43487886359](https://github.com/ajlacabe23-2426/FacelessAI-KairoKnox/actions/runs/43487886359): SUCCESS.
- Separate private phone-review exports were locally rendered from these native sources with one readable lower-third caption lane, original audio intact, additional short teaching prompts between spoken segments, and integrated loudness normalized from approximately -31 LUFS to approximately -18 LUFS. Complete H.264/AAC decode and per-scene contact-sheet inspection passed. The private MP4s and SRT/covers are user-facing conversation attachments, **not committed to Git or hosted for automatic publishing**.
- **Still blocked:** Kokoro `am_michael` is a temporary voice, not the approved Ainsley voice; no approved usable Ainsley narration master was accessible and only 0.54 Higgsfield credits were available. A direct upload to Descript failed due to runtime DNS/storage access; the fallback Descript app upload panel was opened for handoff. Final user voice/aesthetic review and exact-asset approval have not occurred. No Instagram/TikTok/YouTube post scheduled or published, no Threads post, no paid service run.
- PR remains **draft**. Technical media validation is not proof of final creative acceptance, and the open PR has no permission to publish.

## Final-candidate production receipt (2026-11-13)

[GitHub Actions run #43502808440](https://github.com/ajlacabe23-2426/FacelessAI-KairoKnox/actions/runs/43502808440) finished **SUCCESS** with voice generation, TypeScript, two full-size Remotion renders, caption burn, audio mastering, FFprobe stream/duration checks, and independent full-decode checks. Private artifact: `kairo-code-first-posting-candidates-private` (#14074847403).

- Micro Learning candidate: `micro-learning-posting-candidate.mp4`, **1080×1920**, 30fps, H.264/AAC 48kHz, **30.100 sec**, 2,249,595 bytes.
- Signal Cut candidate: `signal-cut-posting-candidate.mp4`, **1080×1920**, 30fps, H.264/AAC 48kHz, **30.100 sec**, 2,267,641 bytes.
- Both have actual narrated audio, generated line-timed burned-in captions and sidecar SRTs, original ambient audio, original coded progress/motion, and an exported poster still.
- Independent local FFprobe and representative still-frame review confirmed correct compositions and readable large captions; audio max samples approx -1 dBFS and mean level around -20 dBFS, with no >0.9-second low-level silence intervals detected at -37 dBFS.
- A couple of **sub-frame caption cue overlaps (5–14 ms)** were observed in the original sidecar subtitle timing. The exported private posting bundle contains corrected **non-overlapping SRTs**; the already burned subtitle layers are unchanged. Future rendering code should clamp caption end times to the next start to avoid this tiny overlap.
- Remaining human review: full sequential phone playback, subjective narration quality and named-brand voice decision, licensing check, source accuracy, platform-safe overlays and approval of exact per-platform packages. **NO-GO for publishing until explicitly approved.**
- The two final MP4s were packaged outside Git in a private review archive with posters, SRT, copy, QA manifest and release checklist. The assistant did not publish/schedule content or merge branches.
