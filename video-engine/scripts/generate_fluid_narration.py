#!/usr/bin/env python3
"""Generate neural REVIEW narration, measured phrase captions and original low-level score.

No paid generation API, voice cloning, credentials or social distribution.
am_michael is a temporary generic review voice, not the owner's approved narration identity.
"""
from __future__ import annotations
import argparse
import json
import math
import re
import subprocess
import textwrap
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

FPS = 60
SAMPLE_RATE = 24000
DURATION = 68.0
VOICE = "am_michael"
HOP_SECONDS = 7.5
FIRST_CUE = 0.46

SCRIPTS: dict[str, list[tuple[str, str]]] = {
    "NvidiaEconomyFluid60": [
        ("Nvidia surged about thirty one percent.", "But does one stock rally mean the whole economy is healthy?"),
        ("Its board voted to bring founder Jensen Huang back.", "The decision came before the public November twenty third announcement."),
        ("Nearly a trillion dollars of market value returned.", "That is stock valuation, not a trillion dollars of new economic output."),
        ("Follow the AI supply chain.", "Chipmakers, data centers, electricity providers, and customers all face real costs."),
        ("Borrowing costs and inflation still affect the economy.", "A sharp tech rally does not make those pressures disappear."),
        ("Nvidia acknowledged senior government input.", "Trump said he intervened. Neither fact alone proves illegal trading."),
        ("Shares also moved before the announcement.", "But earlier public signals and a wider rebound offer alternative explanations."),
        ("The board action and market moves are established.", "A coordinated illegal trading scheme has not been established here."),
        ("The key questions are who knew what, and when.", "Were trades made using private information? Follow the evidence."),
    ],
    "AgentProgrammingFluid60": [
        ("An AI agent is a controlled loop.", "It receives a task, chooses a tool, and checks the result."),
        ("Our demo agent works on helpdesk tickets.", "It can read ticket status, but it cannot change access."),
        ("An agent needs a model, tools, and rules.", "Permissions must be enforced outside the model, in code."),
        ("Start with a read only Python function.", "It returns approved ticket information from a local sample database."),
        ("Register that function as an agent tool.", "The model can request the call, but cannot redefine the permission boundary."),
        ("The user asks about ticket T one oh four.", "Trace the tool call, sample response, and final explanation."),
        ("Test valid and unknown tickets first.", "Then test malformed identifiers and attempts to write forbidden changes."),
        ("Prompt instructions help, but are not security controls.", "Validate inputs and enforce permissions in the application."),
        ("Build one harmless lookup tool.", "Inspect the trace and write three tests before adding capabilities."),
    ],
    "PromptEngineeringFluid60": [
        ("A better prompt is not simply a longer one.", "It is a testable specification of a task and its evidence."),
        ("Here is the weak request: summarize this incident.", "The audience, source rules, and output requirements are missing."),
        ("Start by defining the audience and authoritative sources.", "Then name the output format and what counts as success."),
        ("Now require timestamps and separate facts from unknowns.", "Explicitly prohibit adding details unsupported by the incident log."),
        ("Every conclusion should point to its source.", "When the evidence is missing, say unknown instead of inventing details."),
        ("Structured output makes the result easier to verify.", "Use fields for facts, uncertainties, and recommended follow up checks."),
        ("Suppose the answer identifies an attacker without evidence.", "A validator should reject that unsupported claim."),
        ("Change one instruction at a time.", "Compare both prompts against the same source and evaluation rubric."),
        ("Specify the task, verify each claim, and iterate.", "Reliable, measurable answers beat impressive looking text."),
    ],
}

def stamp(seconds: float, srt: bool = False) -> str:
    if srt:
        millis = round(seconds * 1000)
        hrs, rem = divmod(millis, 3600000)
        mins, rem = divmod(rem, 60000)
        secs, ms = divmod(rem, 1000)
        return f"{hrs:02d}:{mins:02d}:{secs:02d},{ms:03d}"
    cs = round(seconds * 100)
    hrs, rem = divmod(cs, 360000)
    mins, rem = divmod(rem, 6000)
    secs, sub = divmod(rem, 100)
    return f"{hrs}:{mins:02d}:{secs:02d}.{sub:02d}"

def synth(pipeline: KPipeline, phrase: str) -> np.ndarray:
    parts = []
    for _, _, audio in pipeline(phrase, voice=VOICE, speed=1.12):
        samples = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        parts.append(np.asarray(samples, dtype=np.float32))
    if not parts:
        raise RuntimeError("No speech generated: " + phrase)
    return np.concatenate(parts)

def fit_segment(wave: np.ndarray, allotted_seconds: float) -> np.ndarray:
    current = len(wave) / SAMPLE_RATE
    if current <= allotted_seconds:
        return wave
    factor = current / allotted_seconds
    if factor > 1.40:
        raise RuntimeError(f"Speech requires {factor:.2f}x speed, exceeds natural review threshold.")
    out = subprocess.run(
        ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
         "-f", "f32le", "-ar", str(SAMPLE_RATE), "-ac", "1", "-i", "pipe:0",
         "-af", f"atempo={factor + 0.015:.4f}", "-f", "f32le", "pipe:1"],
        input=wave.tobytes(), capture_output=True, check=True
    )
    result = np.frombuffer(out.stdout, dtype=np.float32).copy()
    if len(result) / SAMPLE_RATE > allotted_seconds + 0.02:
        raise RuntimeError("Time-fit exceeded its scene slot")
    return result

def score(name: str) -> np.ndarray:
    length = round(DURATION * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float64) / SAMPLE_RATE
    base = {"NvidiaEconomyFluid60": 73, "AgentProgrammingFluid60": 97,
            "PromptEngineeringFluid60": 83}[name]
    music = .006 * np.sin(2 * math.pi * base * t)
    music += .0025 * np.sin(2 * math.pi * (base * 1.502) * t)
    music *= (.72 + .18 * np.sin(2 * math.pi * .072 * t))
    for i in range(1, 9):
        start = int(i * HOP_SECONDS * SAMPLE_RATE)
        pulse_t = np.arange(round(.32 * SAMPLE_RATE)) / SAMPLE_RATE
        pulse = .018 * np.exp(-19 * pulse_t) * np.sin(2 * math.pi * 337 * pulse_t)
        music[start:start + len(pulse)] += pulse
    music[:round(.25*SAMPLE_RATE)] *= np.linspace(0, 1, round(.25*SAMPLE_RATE))
    music[-round(.5*SAMPLE_RATE):] *= np.linspace(1, 0, round(.5*SAMPLE_RATE))
    return music.astype(np.float32)

def subtitle_files(cues: list[tuple[float, float, str]], dest: Path, stem: str) -> None:
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Voice,DejaVu Sans,57,&H00FFFFFF,&H00FFFFFF,&H000C1220,&H98070D18,-1,0,0,0,100,100,0,0,3,18,0,2,90,90,275,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ass = [header]
    srt = []
    for i, (start, end, phrase) in enumerate(cues, 1):
        if not 0 <= start < end <= DURATION:
            raise RuntimeError(f"Invalid caption timing: {start}, {end}")
        clean = re.sub(r"[{}]", "", phrase)
        wrapped = textwrap.wrap(clean, 36, break_long_words=False, break_on_hyphens=False)
        if len(wrapped) > 2:
            wrapped = textwrap.wrap(clean, 44, break_long_words=False, break_on_hyphens=False)
        if len(wrapped) > 2:
            raise RuntimeError("Phrase is too long for a readable subtitle: " + clean)
        ass.append(f"Dialogue: 0,{stamp(start)},{stamp(end)},Voice,,0,0,0,,"
                   + r"{\fad(90,110)}" + r"\N".join(wrapped) + "\n")
        srt.append(f"{i}\n{stamp(start,True)} --> {stamp(end,True)}\n"
                   + "\n".join(wrapped) + "\n\n")
    (dest / (stem + ".ass")).write_text("".join(ass), encoding="utf-8")
    (dest / (stem + ".srt")).write_text("".join(srt), encoding="utf-8")

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("film", choices=tuple(SCRIPTS))
    parser.add_argument("--outdir", type=Path, default=Path("out"))
    args = parser.parse_args()
    args.outdir.mkdir(parents=True, exist_ok=True)
    pipeline = KPipeline(lang_code="a")
    mix = score(args.film)
    captions = []
    evidence = []
    for index, (first, second) in enumerate(SCRIPTS[args.film]):
        start = index * HOP_SECONDS + FIRST_CUE
        end = min(DURATION - .15, index * HOP_SECONDS + 7.29)
        phrases = [first, second]
        waves = [synth(pipeline, phrase) for phrase in phrases]
        available = end - start - .18
        raw = sum(len(w) / SAMPLE_RATE for w in waves)
        if raw > available:
            factor = raw / available
            if factor > 1.40:
                raise RuntimeError(f"{args.film} scene {index+1} needs {factor:.2f}x playback")
            waves = [fit_segment(w, len(w) / SAMPLE_RATE / (factor + .025)) for w in waves]
        cursor = start
        for phrase, wave in zip(phrases, waves):
            n = round(cursor * SAMPLE_RATE)
            if n + len(wave) > len(mix) or cursor + len(wave)/SAMPLE_RATE > end + .06:
                raise RuntimeError("Narration exceeded scene end: " + args.film)
            fade = min(round(.018 * SAMPLE_RATE), len(wave)//7)
            if fade:
                wave[:fade] *= np.linspace(0,1,fade, dtype=np.float32)
                wave[-fade:] *= np.linspace(1,0,fade, dtype=np.float32)
            mix[n:n + len(wave)] += .82 * wave
            cue_end = min(end, cursor+len(wave)/SAMPLE_RATE+.09)
            captions.append((cursor, cue_end, phrase))
            evidence.append({"scene": index+1, "start": round(cursor,3),
                             "end": round(cue_end,3), "phrase":phrase})
            cursor = cue_end + .09
        print(args.film, "scene", index+1, "finish", round(cursor,2), "end", end, flush=True)
    peak = float(np.max(np.abs(mix)))
    if peak > .92:
        mix *= .92 / peak
    stem = args.film + "_TEMP_REVIEW_NARRATION"
    sf.write(args.outdir/(stem+".wav"), mix, SAMPLE_RATE, subtype="PCM_16")
    subtitle_files(captions, args.outdir, stem)
    (args.outdir/(stem+"_TIMING.json")).write_text(json.dumps({
        "film":args.film,"review_voice":VOICE,"duration_seconds":DURATION,
        "voice_approved":False,"captions_phrase_timed_from_waveforms":True,
        "publish_authorized":False,"cues":evidence}, indent=2))
    print(json.dumps({"film":args.film,"cues":len(captions),"status":"TEMP_NARRATION_REVIEW_ONLY"}))

if __name__=="__main__":
    main()
