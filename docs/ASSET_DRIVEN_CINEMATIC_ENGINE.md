# Kairo Knox — Asset-driven cinematic engine, v2.1 (credit-free foundation)

**Status:** CODE + STORYBOARD READY; **NOT** full production readiness. No voice was generated, no proprietary imagery is included, no purchased credits were used, and no publishing action is implemented.

## Why this exists

The prior vector renderer could draw beautiful diagrams but could not make a richly illustrated scene act like a film. Cinematic v2.1 preserves the existing Remotion 4/React 19 60fps clock and introduces an independent **asset-first** pipeline for the three queued films. It separates illustrated subject, foreground, action part, and environment into composited depth planes; each plane is animated deterministically with a distinct transform, pivot, focus blur, and layer lighting.

A single complete flattened image is **not** a performance rig. Code can give it a cinematic push or parallax, but it cannot reconstruct hidden surfaces, rotate a character convincingly, or animate facial muscles from pixels that do not exist. For performance animation, request alpha-matted body/arm/head/props, depth maps or image-to-video/3D rigs when budget permits. Remotion then provides editability, framing, subtitles, audio and scene timing.

## What is implemented

- 27 independently directed 8-second scenes across *AI Agent Programming*, *Prompt Engineering*, and *How to Buy a Car*.
- 60fps 1080×1920 composition contract, 30-frame scene overlap, 68-second total, frame-seekable camera motions, depth-sensitive parallax, pivoted sublayers for articulated props, controlled blur/focus pulls, bounded light-sweep and safe-area typography.
- Four **separate source assets per scene**: environment (JPG), character (transparent PNG), action (transparent PNG), foreground (transparent PNG). There are **108 pending slots**, and no imagery has been misrepresented as ready.
- Narration cue attached to every storyboard beat, as a future alignment reference only. No captions, speech timing or audio tracks have been fabricated.
- Safe-path and source-rights checks; video may render placeholder previews, but **strict asset export refuses unapproved slots**.
- Full release preflight requires rights-cleared local images, a real narration file, timestamped caption JSON and a user approval record. Independently inspect final MP4/audio and factual claims before publishing.

## Where it lives

- `video-engine/src/asset-cinema/AssetDrivenFilm.tsx`: image-based scene compositor and rendering composition.
- `video-engine/src/asset-cinema/motion.ts`: pure deterministic camera, articulated-layer and lighting math.
- `video-engine/asset-cinema/shot-plans.json`: full 27-shot storyboard and expected asset filenames.
- `video-engine/scripts/check-assets.mjs`: offline plan / asset / release preflight.
- `video-engine/tests/asset-cinema.test.mjs`: validation regression tests.

## No-credit workflow

From repository root:

```bash
cd video-engine
npm ci --no-audit --no-fund # when dependencies/lockfile are available, else npm install
npm run assets:check
npm run assets:test
npm run typecheck
npm run assets:storyboard:agent
```

Storyboard-only previews are visibly marked and deliberately **not final videos**. The release check is designed to fail until real assets arrive:

```bash
npm run assets:check:ready
node scripts/check-assets.mjs --mode release --voice local/narration.wav \
  --captions local/verified-captions.json --approval local/approval.json
```

When illustrations arrive, save them at the local `public/cinema-assets/<film>/<scene>/<slot>.png` (environment is `.jpg`) paths given in the manifest. Confirm original/cleared rights, then set only that asset's `rights.status` to `cleared` and provide a real rights-evidence reference. Asset files, voice masters, credentials and customer media should remain private unless specifically approved for distribution. Do not commit voice clones or unlicensed content to the public repository.

## Animation quality and proof gates

1. Validate source-resolution, alpha mattes and non-transparent foreground coverage. A moving PNG with a bad mask still looks like a paper cutout.
2. Test consistent character identity, perspective, body articulation and shadow direction across neighboring scenes.
3. Watch first 3 seconds on a real phone for comprehensible action, readable text and visual storytelling.
4. Render a **true native 60fps** film and inspect full-resolution frame samples, smooth transitions and motion continuity. A storyboard with missing assets is not valid quality evidence.
5. Generate narration with the user-owned voice **locally only**, add word-aligned captions, normalize/mix audio, and verify `ffprobe` tracks and end-to-end sync.
6. Independently check each factual claim (car taxes and registration fees vary by location), rights and final user sign-off before publishing.

## Future credit/plugin slots (no provider lock-in)

- **Still artwork**: any original, rights-cleared generated illustration/artist renders exported as environment + alpha subject + props, not a generic single merged JPEG.
- **Character motion**: optional motion-transfer / image-to-video / 3D character adapter exports as a rendered alpha video overlay. A standard video layer can replace a PNG when explicitly implemented and tested; this version's compositor currently accepts only still image layers.
- **Audio**: canonical, permissioned local Mac voice engine can output a WAV file; it is not accessible through an iPhone until a private Mac service is configured. Avoid publicly exposing biometric voice files.
- **Editing**: optional Descript or other editor after full-length, licensed source files exist and credits return.

Provider choice is intentionally **not built into the renderer**. The interface is the exported asset, not a paid API call. This means spending credits later enhances the scene assets rather than forcing a new application architecture.
