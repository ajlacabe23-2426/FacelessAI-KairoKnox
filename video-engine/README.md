# Kairo Code-Driven Video Engine

The original Remotion/GSAP 30fps pilots remain intact. New productions default to the **Kairo Cinematic Engine v2**, a separate 60fps, typed, deterministic, multi-plane cinematic motion system with reusable camera, transitions, telemetry, kinetic typography and filmic compositing.

- [Architecture and mandatory motion guardrails](../docs/CINEMATIC_ENGINE_V2.md)
- [Cinematic engine implementation](src/cinema/CinematicEngine.tsx)
- [Typed episode plan](src/cinema/plan.ts)
- [Existing legacy pilot guidance](../docs/production/2026-11-13_two_coded_pilots.md)

## Run

Requires Node 22+, Chrome/Chromium, FFmpeg, and an environment that can download npm dependencies.

    npm install --no-audit --no-fund
    npm run motion:check
    npm run typecheck
    npm run studio
    npm run render:cinema:smoke
    npm run render:cinema

4K offline full-duration render:

    npm run render:cinema:4k

Owned narration and sampled reactive spectrum follow the exact local steps in the [specification](../docs/CINEMATIC_ENGINE_V2.md). Files in public/ and out/ are ignored. Do not commit private voice files, fabricated platform analytics, copyrighted footage or credentials.

Legacy 30fps pilots remain runnable:

    npm run render:smoke
    npm run render:pilot
    npm run render:signal:smoke

A green CI smoke is **not** a professional quality rating or approval to publish. Review full video, narration, synchronized captions, rights, visuals and crop on-device. Human approval is required before posting.
