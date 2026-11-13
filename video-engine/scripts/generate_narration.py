#!/usr/bin/env python3
"""Generate original, unapproved Kokoro test narration plus exact line-timed caption files.

Local/open-weight workflow. Does not call paid media providers or publish anything.
The chosen narrator is NOT the user's separately preferred named/branded voice.
"""
from __future__ import annotations

import argparse
import re
import textwrap
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

SAMPLE_RATE = 24000
DURATION = 30.0
VOICE = "am_michael"

# Each entry is start time, original spoken text, and end-of-scene hard boundary.
# Keeps the video structure and captions aligned with the actual TTS output.
EPISODES = {
    "micro": [
        (0.50, "Here's how your app loads fresh information.", 5.0),
        (2.95, "It's a request, then a response.", 5.0),
        (5.35, "Your phone sends an HTTP request to a server.", 14.5),
        (9.45, "For example, it asks for the latest articles.", 14.5),
        (14.85, "The server sends back a response containing data.", 23.0),
        (18.9, "The app reads that reply and updates your screen.", 23.0),
        (23.30, "Request. Response. Display.", 30.0),
        (26.3, "That's the basic idea behind an API.", 30.0),
    ],
    "signal": [
        (0.4, "Your feed isn't reading your mind.", 5.0),
        (2.70, "It's learning from what you do.", 5.0),
        (5.30, "Watch time can be a signal.", 13.5),
        (7.80, "So can likes, shares, or skipping a post.", 13.5),
        (10.90, "Each is only one clue.", 13.5),
        (13.85, "A ranking system weighs many signals.", 22.0),
        (16.85, "Then it chooses what content to recommend next.", 22.0),
        (20.35, "And the cycle repeats.", 22.0),
        (22.35, "Relevance isn't the same as truth.", 30.0),
        (25.45, "Choose your sources. Question your feed.", 30.0),
    ],
}


def synthesize(pipeline, text: str, speed: float) -> np.ndarray:
    chunks = []
    for _, _, audio in pipeline(text, voice=VOICE, speed=speed):
        sample = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        chunks.append(np.asarray(sample, dtype=np.float32))
    if not chunks:
        raise RuntimeError("Kokoro returned no speech: " + text)
    result = np.concatenate(chunks)
    fade = min(int(SAMPLE_RATE * 0.035), len(result) // 8)
    if fade:
        result[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
        result[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    return result


def original_bed(name: str) -> np.ndarray:
    """Very quiet original ambient sound and nonmelodic transition cues."""
    n = round(SAMPLE_RATE * DURATION)
    t = np.arange(n, dtype=np.float32) / SAMPLE_RATE
    base = 108 if name == "signal" else 92
    bed = (np.sin(2*np.pi*base*t) + .3*np.sin(2*np.pi*(base*1.5)*t))
    envelope = .60 + .22 * np.sin(2*np.pi*.09*t)
    result = (.009 * bed * envelope).astype(np.float32)
    for sec in ([5, 14.5, 23] if name == "micro" else [5, 13.5, 22]):
        at = round(sec * SAMPLE_RATE)
        tau = np.arange(int(SAMPLE_RATE*.18), dtype=np.float32)/SAMPLE_RATE
        cue = (.03*np.exp(-23*tau)*np.sin(2*np.pi*590*tau)).astype(np.float32)
        result[at:at+len(cue)] += cue
    result[-int(SAMPLE_RATE*.4):] *= np.linspace(1,0,int(SAMPLE_RATE*.4),dtype=np.float32)
    return result


def ass_stamp(seconds: float) -> str:
    centiseconds = round(seconds * 100)
    hours, rem = divmod(centiseconds, 360000)
    minutes, rem = divmod(rem, 6000)
    whole, cs = divmod(rem, 100)
    return f"{hours}:{minutes:02d}:{whole:02d}.{cs:02d}"


def srt_stamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, rem = divmod(millis, 3600000)
    minutes, rem = divmod(rem, 60000)
    whole, ms = divmod(rem, 1000)
    return f"{hours:02d}:{minutes:02d}:{whole:02d},{ms:03d}"


def caption_lines(text: str) -> str:
    # Keep words intact and avoid more than two lines in this phone-first design.
    lines = textwrap.wrap(text, width=30, break_long_words=False, break_on_hyphens=False)
    if len(lines) > 2:
        lines = textwrap.wrap(text, width=37, break_long_words=False, break_on_hyphens=False)
    if len(lines) > 2:
        raise RuntimeError("Caption too long for phone-safe 2-line treatment: " + text)
    return "\\N".join(lines)


def write_caption_files(name: str, cues: list[tuple[float, float, str]], outdir: Path):
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narration,DejaVu Sans,57,&H00FFFFFF,&H00FFFFFF,&H00130D23,&HAE0B1026,-1,0,0,0,100,100,0,0,3,18,0,2,100,100,335,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ass_lines = [header]
    srt_lines = []
    for index, (start, end, text) in enumerate(cues, 1):
        if not (0 <= start < end <= DURATION):
            raise RuntimeError("Broken cue bounds: " + str((start, end)))
        escaped = re.sub(r"[{}]", "", text)
        line = caption_lines(escaped)
        ass_lines.append(
            f"Dialogue: 0,{ass_stamp(start)},{ass_stamp(end)},Narration,,0,0,0,,"
            + "{\\fad(120,140)}" + line + "\n"
        )
        srt_lines.append(
            f"{index}\n{srt_stamp(start)} --> {srt_stamp(end)}\n"
            + line.replace("\\N", "\n") + "\n\n"
        )
    (outdir / f"{name}-captions.ass").write_text("".join(ass_lines), encoding="utf-8")
    (outdir / f"{name}-captions.srt").write_text("".join(srt_lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--outdir", type=Path, default=Path("public"))
    parser.add_argument("--captions-dir", type=Path, default=Path("out"))
    args = parser.parse_args()
    args.outdir.mkdir(parents=True, exist_ok=True)
    args.captions_dir.mkdir(parents=True, exist_ok=True)

    pipeline = KPipeline(lang_code="a")
    for name, lines in EPISODES.items():
        mix = original_bed(name)
        segments = []
        for index, (start, text, scene_end) in enumerate(lines):
            next_start = lines[index+1][0] if index+1 < len(lines) else DURATION
            limit = min(scene_end, next_start) - .08
            allotted = limit - start
            if allotted < .5:
                raise RuntimeError("Invalid narrator slot")
            # Choose a natural speaking pace first. If a cue is long, permit a slightly
            # quicker delivery but never truncate or silently overlap the next line.
            for speed in (1.08, 1.16, 1.24):
                waveform = synthesize(pipeline, text, speed=speed)
                actual = len(waveform)/SAMPLE_RATE
                if actual <= allotted:
                    break
            else:
                raise RuntimeError(
                    f"{name} line {index+1}: {actual:.2f}s cannot fit {allotted:.2f}s: {text}"
                )
            at = round(start*SAMPLE_RATE)
            mix[at:at+len(waveform)] += .79*waveform
            segments.append((start, min(DURATION, start+actual+.13), text))
            print(f"{name} line {index+1}: start={start:.2f} duration={actual:.2f} speed={speed}", flush=True)
        peak = float(np.max(np.abs(mix)))
        if peak > .90:
            mix *= .90 / peak
        output = args.outdir / ("micro-learning-narration.wav" if name == "micro" else "signal-cut-narration.wav")
        sf.write(output, mix, SAMPLE_RATE, subtype="PCM_16")
        write_caption_files(name, segments, args.captions_dir)
        print(f"{name}: saved {output} and timed ASS/SRT captions", flush=True)


if __name__ == "__main__":
    main()
