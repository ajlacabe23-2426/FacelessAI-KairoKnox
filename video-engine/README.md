# Kairo Knox — code-first animation pilot (review only)

Two original 30-second, vertical, 1080x1920 / 30 fps compositions built in Remotion and GSAP: **MicroLearningPilot** (how an app obtains data through an API) and **SignalCutPilot** (illustrative recommendation feedback loop). The default Studio compositions are silent; narrated private review renders can be generated with the optional open-weight TTS step below. These are **not** publication-approved masters.

## Install and preview

Requires Node 22+, a supported Chrome/Chromium renderer, and FFmpeg (Remotion may download its compatible browser). Do not install or run paid generation plugins.

```sh
cd video-engine
npm install --no-audit --no-fund
npm run typecheck
npm run studio
```

## Private local render

```sh
npm run render:smoke
npm run render:pilot
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate,codec_name -of json out/micro-learning-pilot.mp4
```

The smoke command renders just two seconds at half-size to exercise the renderer. It does not pass the full visual/audio acceptance gate. For a narration file that you **own or have permission to use**, put it in `video-engine/public/` (ignored by Git), then set `narrationFile` as a Remotion input prop such as `{"narrationFile":"voiceover.wav"}`. The default video has **no audio**. Captions visible in the sample are visual teaching cards, not synchronized, accessible spoken-word subtitles.

Keep all outputs and private audio **outside Git**. Do not publish, commit private voices, or treat a successful build as video approval. Compare local master at native resolution for motion, phone-safe crop, source accuracy, voice/caption sync, audio peak level, and a verified duration with ffprobe. Hand off a locally rendered file for explicit final review.

## Two-episode private review render (open-weight voice option)

`scripts/generate_narration.py` uses Kokoro-82M with the original `am_michael` test voice. It is not the named production voice, and the model requires a one-time open-weight download. Review licensing for any actual commercial workflow.

```sh
# Requires Python 3.11+, FFmpeg and espeak-ng
python -m pip install 'kokoro==0.9.4' 'soundfile==0.13.1'
python scripts/generate_narration.py --outdir public
npx remotion render src/index.ts MicroLearningPilot out/micro-learning-review.mp4 --props=render-micro.json --codec=h264
npx remotion render src/index.ts SignalCutPilot out/signal-cut-review.mp4 --props=render-signal.json --codec=h264
```

The GitHub Actions `episode-review-renders.yml` creates reduced-scale (810×1440) narrated MP4s **only for review**, passes FFprobe duration/codec/audio preflight and uploads them as short-lived GitHub Action artifacts. Do not interpret CI or a successful audio stream as a real creative/voice/captions signoff. See [two-episode validation receipt](../docs/production/2026-11-13_two_coded_pilots.md). No connected account is authorized for social posting.

## Architecture and spend policy

- **Remotion** owns the frame clock, composition, audio, and H.264 export. **GSAP** is used only through `useGsapTimeline()` for frame-seekable DOM/SVG motion. Never use freestanding ticker animations or unseeded random motion.
- Reusable original code/SVG is the default for Micro Learning and Signal Cuts, before any fee-bearing text-to-video service is considered.
- Use stock/third-party visuals only after checking reuse rights. The code demo is a simplified illustration, not actual API traffic.
- Character performance, physically complex scenes, and lip-sync are separate requirements; this pilot does **not** solve 3D acting, Kairo Chronicles combat choreography, or character voice quality.
- Versions are pinned in package.json. After installation produces a lockfile, review and commit the lockfile in a follow-up PR before treating package installation as reproducible. CI may not have rendered yet; check actual GitHub Actions status.
- Follow [the canonical Kairo production/review workflow](../docs/CONTENT_WORKFLOW.md). A render does not authorize publishing.
