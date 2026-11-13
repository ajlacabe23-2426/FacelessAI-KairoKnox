#!/usr/bin/env python3
"""Private vertical final-candidate finishing: burn actual timed captions, master audio, QA.

Does not post, share, schedule or approve media. Requires existing rendered videos and
line-accurate ASS cues produced by generate_narration.py.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def probe(path: Path) -> dict:
    return json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries",
         "stream=codec_name,codec_type,width,height,r_frame_rate", "-show_entries",
         "format=duration,size", "-of", "json", str(path)], text=True))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("episode", choices=("micro", "signal"))
    p.add_argument("--outdir", type=Path, default=Path("out"))
    args = p.parse_args()
    args.outdir.mkdir(parents=True, exist_ok=True)
    stem = "micro-learning" if args.episode == "micro" else "signal-cut"
    source = args.outdir / (stem + "-review.mp4")
    ass = args.outdir / (args.episode + "-captions.ass")
    srt = args.outdir / (args.episode + "-captions.srt")
    final = args.outdir / (stem + "-posting-candidate.mp4")
    poster = args.outdir / (stem + "-poster.png")

    for path in (source, ass, srt):
        if not path.is_file() or not path.stat().st_size:
            raise SystemExit("Missing input: " + str(path))
    # Preserve true 1080x1920 render, burn captions only where speech is audible,
    # and master to broadcast-friendly spoken-content loudness.
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
        "-vf", f"subtitles={ass.as_posix()}",
        "-af", "highpass=f=65,acompressor=threshold=0.08:ratio=2:attack=18:release=180,"
               "loudnorm=I=-16:TP=-1.8:LRA=10,alimiter=limit=0.92",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", "30",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-ac", "2", "-movflags", "+faststart", str(final),
    ])
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
         "-ss", "2", "-i", str(final), "-frames:v", "1", str(poster)])
    metadata = probe(final)
    if not (29.9 <= float(metadata["format"]["duration"]) <= 30.1):
        raise SystemExit("Video duration out of range")
    videos = [s for s in metadata["streams"] if s["codec_type"] == "video"]
    audios = [s for s in metadata["streams"] if s["codec_type"] == "audio"]
    if not (len(videos) == 1 and len(audios) == 1 and
            videos[0]["width"] == 1080 and videos[0]["height"] == 1920 and
            videos[0]["r_frame_rate"] == "30/1"):
        raise SystemExit("Unexpected video/audio tracks or dimensions: " + str(metadata))
    if final.stat().st_size < 350_000:
        raise SystemExit("Output file is suspiciously small")
    # Force a full decode to catch corrupt frames, not merely an MP4 header pass.
    run(["ffmpeg", "-v", "error", "-xerror", "-i", str(final),
         "-f", "null", "-"])
    print(json.dumps({
        "episode": args.episode, "status": "TECHNICAL_CHECKS_PASSED_REVIEW_PENDING",
        "file": str(final), "poster": str(poster), "external_srt": str(srt),
        "duration_seconds": float(metadata["format"]["duration"]),
        "size_bytes": final.stat().st_size, "streams": metadata["streams"],
        "published": False, "human_approved": False,
    }, indent=2))


if __name__ == "__main__":
    main()
