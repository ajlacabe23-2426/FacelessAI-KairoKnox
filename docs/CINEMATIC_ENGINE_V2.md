# Kairo Cinematic Engine v2 — production architecture and non-negotiable motion contract

Status: **implementation proposed for private review**. The engine produces code-rendered visuals without paying for generation credits. A render, a CI green check and an approved publishable master remain separate states.

## Stack

- Remotion 4.0.539 and React 19, pinned to the repository's existing working versions. It owns frame clock, audio, compositions and offline H.264.
- TypeScript 5.9 (strict). Scene data in an immutable, typed plan and runtime validation. Every beat has a stable ID, exact start/duration frames, factual explanatory text, accent and telemetry.
- Existing GSAP dependency is retained for legacy pilots. v2 motion runs entirely from the Remotion clock, not GSAP tickers; enabling GSAP in future v2 scenes requires seekable useGsapTimeline only.
- Native SVG and composited CSS layers provide deterministic vector motion, glow, approximate ambient shadowing, depth blur, chromatic edge separation, grain and a travelling light beam. They are stylistic approximations, **not physically based GPU ambient occlusion or true volumetric scattering**. For real 3D/SSAO, add a separately tested Three.js/WebGL adapter with GPU render determinism checks.
- Standard-library Python extracts three spectral envelopes at 60 Hz from owned 16 kHz PCM audio. Audio and generated envelopes stay local. Narration is optional; a silent render is not publication-ready.

## Structure

- src/cinema/schema.ts — exact typed plan and runtime acceptance gates
- src/cinema/plan.ts — reproducible 3-beat identity-security demonstration
- src/cinema/motion.ts — solved cubic Bézier, spring constants, seeded positions and frame-based camera
- src/cinema/components/CinematicCamera.tsx — continuous frame-derived camera drift
- src/cinema/components/ParallaxStage.tsx — background geometry, mid-ground focal plane and deterministic floating foreground
- src/cinema/components/KineticText.tsx — per-character spring animation with inertia and movement-sensitive chromatic edge
- src/cinema/components/FluidTransition.tsx — 24-frame overlapped velocity-symmetric transitions
- src/cinema/components/TelemetryHUD.tsx — vector trace, telemetry and spectral driver
- src/cinema/components/FilmGrainOverlay.tsx — fixed-seed texture translated per frame, soft vignette and light sweep
- src/cinema/CinematicEngine.tsx — orchestrator, scene graph and optional audio
- scripts/check-cinema.mjs — static motion-rule check
- scripts/analyze_audio.py — deterministic audio-frequency envelope compiler

## Exact timing and motion rules

1. All original v2 coded videos have an **offline frame clock fixed at 60fps**. A 1080×1920 master is baseline; 2160×3840 is made with exact 2× scale. 30fps legacy clips stay legacy; never relabel interpolated footage as native 60fps motion.
2. No CSS animations, linear easing, requestAnimationFrame, JS timers, wall clock or unseeded random in v2 frame-critical code. Position = f(frame, fps, scene data, fixed seed, supplied audio bands) with no mutable integrated delta. Frames render identically regardless of evaluation order.
3. Kinetic entrances: Remotion spring, stiffness **138**, damping **17**, mass **0.88**, target duration **40 frames**. Follow-through: stiffness **95**, damping **19**, mass **1.16**, target **52 frames**. Preserve overshoot within safe typography bounds.
4. Default cubic Bézier points: **(0.22,1.00,0.36,1.00)**; scene crossovers: **(0.33,0.00,0.67,1.00)**. Inversion of x(t) uses exactly **18 binary-search iterations**. All transitions use these nonlinear time functions or measured springs.
5. Every scene must overlap its predecessor exactly by 12–48 frames (the example uses **24**). Incoming and outgoing offsets match in magnitude (82px horizontal, 18px vertical) and share the same symmetric curve. Use staggered content entrances and purposeful retained motion.
6. Global camera motion continues across scene boundaries: x = d[12 sin(0.54t)+7 sin(0.23t+0.8)], y = d[13 cos(0.43t)+4 sin(0.31t)], scale = 1 + d[0.036+0.008 cos(0.29t)], t = frame/fps. Depth multipliers create near/mid/far parallax without camera reset.
7. Audio bands are not fabricated from a silent voice track. Supplied spectra index one sample per composition frame; without spectra, the HUD is explicitly labelled **DEMO SIGNAL**. The pipeline must not claim phoneme-accurate captions or audio-reactive sync until they are checked against actual media.
8. Movement-sensitive red/cyan edge separation max **2.5px** on typography. Grain is low-opacity 0.105, fixed-seed and moved by deterministic hash. Vignette is dark at edges, with a legible center. Bloom is carefully bounded and does not obliterate evidence or text.
9. Typography and safety: 90px left/right story margin; hook near 340px y; 105px heavy heading, up to 38px explanatory copy, 19–25px telemetry; preserve 250px bottom reserve for platform UI. No essential captions in outer 90px or lower 250px. Frame-safe crop must be manually checked on each platform.
10. A visual must show an actual causal relationship, a meaningful UI trace or evidence; mere moving particles and glowing frames are insufficient. No repeated scene composition without explicit narrative purpose. Use original/cleared assets only, label fake interfaces and simulated stats, and verify claims before scripting.

## Usage (zero paid model credits)

From the repository root:

    cd video-engine
    npm install --no-audit --no-fund
    npm run motion:check
    npm run typecheck
    npm run studio
    npm run render:cinema:smoke
    npm run render:cinema

To produce a true 4K/60 master on a suitably resourced machine:

    npm run render:cinema:4k

Audio-reactive output from a voice track you own or have permission to use:

    ffmpeg -y -i source-voice.m4a -ac 1 -ar 16000 -c:a pcm_s16le public/narration.wav
    python3 scripts/analyze_audio.py public/narration.wav --narration-file narration.wav --output out/cinema-audio-props.json
    npx remotion render src/index.ts KairoCinematic60 out/cinema-narrated.mp4 --props=out/cinema-audio-props.json --codec=h264 --concurrency=1

Use private files in ignored public/ and out/. Ensure the narration is the same duration as the visual composition; align/extend scenes and recompile envelopes when it is not. Timing, captions, voice consent and music clearance are distinct acceptance gates. The script produces spectral data, **not** speech transcription.

## Review and CI gates

GitHub CI checks source guardrails, strict TypeScript type checking and a 60fps smoke render. Offline rendering generates every frame; real-time playback frame drops depend on device, codec and bit rate, so no blanket no-dropped-frames guarantee is made. A passing smoke does not prove all 4K frames are free of artifacts. Run full-res frame inspection, ffprobe audio/video duration inspection, narration and on-screen captions QA, read all source labels, confirm rights, and obtain explicit review before social publishing. This engine never auto-posts.
