#!/usr/bin/env python3
"""Make two original, local, explicitly provisional voice mixes with open-weight Kokoro.

No paid service, account credential, or social publishing required. Requires a model download
on the first run and an Apache-2.0 compatible open model. This is not the licensed Ainsley voice.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro import KPipeline

SAMPLE_RATE = 24000
DURATION = 30
VOICE = "am_michael"
EPISODES = {
    "micro": [
        (0.55, "Ever wonder how an app gets fresh information?"),
        (5.35, "It asks a server for data, like a list of new articles."),
        (14.85, "The server replies with structured information the app can display."),
        (23.15, "Remember the loop. Request. Response. Screen."),
    ],
    "signal": [
        (0.35, "Your next scroll can influence what you see."),
        (5.35, "Watch time, likes, and shares can shape recommendations."),
        (13.8, "A ranking system may use those signals to select the next post."),
        (22.15, "A feed predicts attention, not truth. Question what you see."),
    ],
}

def synthesize(pipeline, text):
    chunks = []
    for _, _, audio in pipeline(text, voice=VOICE, speed=1.13):
        chunks.append(audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio))
    if not chunks:
        raise RuntimeError("TTS model returned empty audio")
    result = np.concatenate(chunks).astype(np.float32)
    fade = min(len(result) // 8, int(SAMPLE_RATE * 0.04))
    if fade:
        result[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
        result[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    return result

def original_bed(name):
    """Original, subdued non-melodic harmonic ambience under a spoken demo."""
    t = np.arange(SAMPLE_RATE * DURATION, dtype=np.float32) / SAMPLE_RATE
    base = 110.0 if name == "signal" else 98.0
    tones = (np.sin(2*np.pi*base*t) + .45*np.sin(2*np.pi*(base*1.5)*t))
    swell = .68 + .25*np.sin(2*np.pi*.17*t)
    bed = 0.016 * tones * swell
    # Soft scene boundary cues.
    cues = [5.0, 14.5, 23.0] if name == "micro" else [5.0, 13.5, 22.0]
    for sec in cues:
        start = round(sec*SAMPLE_RATE)
        n = int(.25*SAMPLE_RATE)
        v = np.arange(n, dtype=np.float32)/SAMPLE_RATE
        tick = .025*np.exp(-17*v)*np.sin(2*np.pi*530*v)
        bed[start:start+n] += tick
    tail=int(.35*SAMPLE_RATE)
    bed[-tail:] *= np.linspace(1,0,tail,dtype=np.float32)
    return bed.astype(np.float32)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--outdir", default="public")
    args = parser.parse_args()
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True,exist_ok=True)
    pipeline = KPipeline(lang_code="a")
    for name, lines in EPISODES.items():
        mix = original_bed(name)
        limits = [s for s,_ in lines[1:]] + [DURATION-0.4]
        detail = []
        for (start,text),limit in zip(lines,limits):
            waveform = synthesize(pipeline,text)
            available = limit-start-0.10
            actual = len(waveform)/SAMPLE_RATE
            if actual > available:
                raise RuntimeError(f"{name} narration at {start}s is {actual:.2f}s but only {available:.2f}s available: shorten script")
            at=round(start*SAMPLE_RATE)
            mix[at:at+len(waveform)] += 0.76*waveform
            detail.append((start,round(actual,2),text))
        peak = np.max(np.abs(mix))
        if peak > .86:
            mix *= .86/peak
        path=outdir/("micro-learning-narration.wav" if name=="micro" else "signal-cut-narration.wav")
        sf.write(path,mix,SAMPLE_RATE,subtype="PCM_16")
        print(name, "rendered", path, "duration", len(mix)/SAMPLE_RATE, "peak",float(np.max(np.abs(mix))), "lines",detail)

if __name__=="__main__":
    main()
