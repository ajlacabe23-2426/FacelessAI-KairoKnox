"""Generate scene-aligned original Kokoro narration for the 54-second RLS lesson.

Build each scene from measured speech, not guessed per-line fixed slots. Preserve
all speech and phone-safe captions; reject a scene that cannot fit naturally.
No paid generation or publication.
"""
from pathlib import Path
import argparse
import subprocess
import numpy as np
import soundfile as sf
import generate_narration as g

g.DURATION = 54.0
SCENES = [
    (0, 7, ["Logged in does not mean your data is safe.", "Watch the database."]),
    (7, 15, ["Two accounts share an invoices table.", "Each row has an owner."]),
    (15, 22, ["Assume both users have table read access.", "Both invoices are exposed."]),
    (22, 32, ["Enable row level security.", "The read policy matches the owner to your user ID."]),
    (32, 43, ["Run the same query as user A.", "Only your own invoice returns.", "The database filters the rest."]),
    (43, 54, ["Repeat the test as user B.", "Test write policies too.", "Authentication is not authorization."]),
]
GAP = .19
RATE = 1.10
MAX_TEMPO = 1.15

def bed():
    t = np.arange(round(g.SAMPLE_RATE*g.DURATION), dtype=np.float32)/g.SAMPLE_RATE
    signal = (0.006*np.sin(2*np.pi*92*t)+0.002*np.sin(2*np.pi*138*t)).astype(np.float32)
    for sec in [7,15,22,32,43,48]:
        start=round(sec*g.SAMPLE_RATE)
        tau=np.arange(round(.18*g.SAMPLE_RATE),dtype=np.float32)/g.SAMPLE_RATE
        signal[start:start+len(tau)]+=.021*np.exp(-23*tau)*np.sin(2*np.pi*590*tau)
    signal[-round(.4*g.SAMPLE_RATE):]*=np.linspace(1,0,round(.4*g.SAMPLE_RATE))
    return signal

def fit(wave, tempo):
    if tempo <= 1:
        return wave
    result = subprocess.run(
        ["ffmpeg","-nostdin","-hide_banner","-loglevel","error",
         "-f","f32le","-ar",str(g.SAMPLE_RATE),"-ac","1","-i","pipe:0",
         "-af",f"atempo={tempo:.5f}","-f","f32le","pipe:1"],
        input=wave.astype(np.float32).tobytes(),capture_output=True,check=True)
    return np.frombuffer(result.stdout,dtype=np.float32).copy()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--outdir",type=Path,default=Path("public"))
    parser.add_argument("--captions-dir",type=Path,default=Path("out"))
    args=parser.parse_args()
    args.outdir.mkdir(parents=True,exist_ok=True)
    args.captions_dir.mkdir(parents=True,exist_ok=True)
    pipeline=g.KPipeline(lang_code="a")
    mix=bed()
    cues=[]
    for number,(start,end,lines) in enumerate(SCENES,1):
        waves=[g.synthesize(pipeline,line,RATE) for line in lines]
        speech=sum(len(w) for w in waves)/g.SAMPLE_RATE
        available=end-start-.32-.40-GAP*(len(lines)-1)
        tempo=max(1.0,speech/available)
        if tempo>1:
            tempo += .025
        if tempo>MAX_TEMPO:
            raise RuntimeError(f"Scene {number}: {speech:.2f}s speech exceeds {available:.2f}s; requires {tempo:.2f}x")
        waves=[fit(w,tempo) for w in waves]
        actual=sum(len(w) for w in waves)/g.SAMPLE_RATE+GAP*(len(lines)-1)
        if actual > end-start-.32-.22:
            raise RuntimeError(f"Scene {number}: measured fitted speech does not fit")
        cursor=start+.32
        for line,wave in zip(lines,waves):
            offset=round(cursor*g.SAMPLE_RATE)
            assert offset+len(wave)<=len(mix)
            mix[offset:offset+len(wave)]+=.79*wave
            stop=cursor+len(wave)/g.SAMPLE_RATE
            cues.append((cursor,min(end-.08,stop+.10),line))
            print(f"Scene {number} | {cursor:.2f}-{stop:.2f}s | {line}",flush=True)
            cursor=stop+GAP
        print(f"Scene {number}: actual speech+gaps={actual:.2f}s tempo={tempo:.3f}",flush=True)
    assert len(cues)==sum(len(s[2]) for s in SCENES)
    assert all(a[1]<=b[0] for a,b in zip(cues,cues[1:]))
    peak=float(np.max(np.abs(mix)))
    if peak>.90:
        mix*=.90/peak
    sf.write(args.outdir/"micro-learning-narration.wav",mix,g.SAMPLE_RATE,subtype="PCM_16")
    g.write_caption_files("micro",cues,args.captions_dir)
    print("RLS NARRATION AND CAPTIONS COMPLETE — private review only",flush=True)

if __name__=="__main__":
    main()
