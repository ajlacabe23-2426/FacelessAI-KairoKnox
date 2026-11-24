import argparse
import array
import json
import math
import sys
import wave
from pathlib import Path

FPS = 60
WINDOW = 512
FREQUENCIES = (110.0, 600.0, 2100.0)

def magnitude(samples, frequency, sample_rate):
    omega = 2.0 * math.pi * frequency / sample_rate
    coeff = 2.0 * math.cos(omega)
    previous = 0.0
    previous_previous = 0.0
    for i, sample in enumerate(samples):
        hann = 0.5 - 0.5 * math.cos(2.0 * math.pi * i / (len(samples) - 1))
        current = sample * hann + coeff * previous - previous_previous
        previous_previous, previous = previous, current
    power = previous * previous + previous_previous * previous_previous - (
        coeff * previous * previous_previous
    )
    return math.sqrt(max(0.0, power)) / len(samples)

def analyze(input_file: Path):
    with wave.open(str(input_file), 'rb') as stream:
        if stream.getnchannels() != 1 or stream.getsampwidth() != 2 or stream.getframerate() != 16000:
            raise ValueError('Input must be mono, signed 16-bit PCM, 16000 Hz WAV.')
        rate = stream.getframerate()
        raw = stream.readframes(stream.getnframes())
    samples = array.array('h')
    samples.frombytes(raw)
    if sys.byteorder != 'little':
        samples.byteswap()
    expected_frames = math.ceil(len(samples) / rate * FPS)
    raw_bands = []
    for frame in range(expected_frames):
        center = round((frame + 0.5) * rate / FPS)
        start = center - WINDOW // 2
        window = [
            (samples[p] / 32768.0) if 0 <= p < len(samples) else 0.0
            for p in range(start, start + WINDOW)
        ]
        raw_bands.append([magnitude(window, f, rate) for f in FREQUENCIES])
    maxima = [max((row[i] for row in raw_bands), default=1.0) for i in range(3)]
    def scaled(value, maximum):
        return round(min(1.0, math.sqrt(value / maximum)), 4) if maximum else 0.0
    return [
        {'bass': scaled(row[0], maxima[0]),
         'mid': scaled(row[1], maxima[1]),
         'treble': scaled(row[2], maxima[2])}
        for row in raw_bands
    ]

def main():
    parser = argparse.ArgumentParser(description='Deterministic 60 Hz spectral driver for Remotion.')
    parser.add_argument('wav', type=Path)
    parser.add_argument('--output', type=Path, default=Path('out/cinema-audio-props.json'))
    parser.add_argument('--narration-file', default='narration.wav')
    args = parser.parse_args()
    bands = analyze(args.wav)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps({'narrationFile': args.narration_file, 'bands': bands}, separators=(',', ':')),
        encoding='utf-8',
    )
    print(f'Generated {len(bands)} frame-aligned spectral samples at {FPS} fps: {args.output}')

if __name__ == '__main__':
    main()
