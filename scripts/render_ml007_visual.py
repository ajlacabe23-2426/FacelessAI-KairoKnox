#!/usr/bin/env python3
"""Render a PRIVATE Micro Learning 007 visual v2 review.

No real API requests. Reuses approved Fraser WAV, draws original animated-by-edit
simulated mobile app states, then muxes audio. No paid AI generation and no publishing.

python3 scripts/render_ml007_visual.py --voice ml_voice.wav --out ml007_visual_v2.mp4
Requires Pillow, ffmpeg and ffprobe.
"""
import argparse, json, os, shutil, subprocess, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W,H=720,1280
BG="#08111f"
CARD="#11273c"
EDGE="#315a75"
WHITE="#edf7fe"
MUTED="#acc6d9"
CYAN="#68d8ff"
GREEN="#72e9b9"
AMBER="#ffd078"
RED="#ff8499"

# Timestamps in seconds are editorial cues and require a final listen-through.
STATES=[
 (0.0,2.0,"hook","intro"),
 (2.0,4.0,"hook","codes"),
 (4.0,8.0,"setup","menu"),
 (8.0,10.0,"app","public_tap"),
 (10.0,12.0,"app","public_request"),
 (12.0,17.0,"app","public_response"),
 (17.0,20.0,"app","private_tap"),
 (20.0,24.0,"app","private_request"),
 (24.0,29.0,"app","private_response"),
 (29.0,32.0,"app","viewer_signed_in"),
 (32.0,35.0,"app","admin_request"),
 (35.0,42.0,"app","admin_response"),
 (42.0,47.0,"distinction","identity"),
 (47.0,51.0,"distinction","permissions"),
 (51.0,53.7,"recap","200"),
 (53.7,56.0,"recap","401"),
 (56.0,59.0,"recap","403"),
]

def font(n,bold=False,mono=False):
    options=(["/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"] if mono
             else ["/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold
             else ["/usr/share/fonts/truetype/higgsfield/Montserrat-Regular.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"])
    for path in options:
        if os.path.exists(path):return ImageFont.truetype(path,n)
    return ImageFont.load_default()

def txt(d,x,y,s,sz=28,color=WHITE,bold=False,mono=False):
    d.text((x,y),s,font=font(sz,bold,mono),fill=color)

def rect(d,box,fill=CARD,r=22,stroke=EDGE,width=2):
    d.rounded_rectangle(box,radius=r,fill=fill,outline=stroke,width=width)

def wrap(d,s,sz,max_w,bold=False):
    f=font(sz,bold)
    lines=[];current=""
    for word in s.split():
        prospect=(current+" "+word).strip()
        if d.textbbox((0,0),prospect,font=f)[2]>max_w and current:
            lines.append(current); current=word
        else:current=prospect
    if current: lines.append(current)
    return lines

def textwrap(d,x,y,s,sz=28,color=WHITE,max_w=600,bold=False,linegap=8):
    for line in wrap(d,s,sz,max_w,bold):
        txt(d,x,y,line,sz,color,bold)
        y+=sz+linegap
    return y

def base(i,mode):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    for y in range(H):
        t=y/H
        color=(round(5+12*t),round(14+14*t),round(29+21*t))
        d.line((0,y,W,y),fill=color)
    for x in range(0,W,60):d.line((x,180,x,H-180),fill="#112a40",width=1)
    for y in range(185,H-190,95):d.line((0,y,W,y),fill="#10283c",width=1)
    rect(d,(39,32,681,108),"#0c2338",r=17,stroke="#326385")
    txt(d,57,52,"KAIRO // KNOX",29,WHITE,True)
    txt(d,479,60,"ML 007",20,CYAN,True)
    d.line((44,139,676,139),fill=CYAN,width=4)
    txt(d,54,162,"ONE API. THREE RESPONSES.",20,CYAN,True)
    rect(d,(44,1155,676,1199),"#10283b",r=13,stroke="#24425e")
    txt(d,69,1167,"SIMULATED • NO NETWORK • ORIGINAL UI",16,MUTED,True)
    d.rectangle((44,1224,44+int(632*(i+1)/len(STATES)),1230),fill=CYAN)
    return im,d

def button(d,y,label,code,active=False,color=CYAN):
    fill="#244964" if active else "#142e46"
    rect(d,(75,y,645,y+78),fill,r=13,stroke=color if active else "#3d6481",width=3 if active else 2)
    txt(d,95,y+14,code,18,color if active else MUTED,True,True)
    txt(d,95,y+41,label,23,WHITE,True)
    if active:
        d.ellipse((606,y+23,627,y+44),fill=color)
        d.ellipse((609,y+26,624,y+41),fill=WHITE)

def app(d,state):
    guest=state not in ("viewer_signed_in","admin_request","admin_response")
    role="GUEST" if guest else "VIEWER · SIGNED IN"
    rect(d,(53,228,667,1119),"#0d2032",r=27,stroke="#417391",width=3)
    txt(d,83,265,"API STATUS LAB",34,WHITE,True)
    rect(d,(82,326,638,382),"#163249",r=14,stroke="#2f526e")
    txt(d,105,342,"USER ROLE",19,MUTED,True)
    txt(d,303,340,role,20,AMBER if guest else CYAN,True)
    active={ "public_tap":0,"public_request":0,"public_response":0,
              "private_tap":1,"private_request":1,"private_response":1,
              "admin_request":2,"admin_response":2 }.get(state,-1)
    for idx,(code,label) in enumerate((("GET","View Public Lesson"),("GET","Open Private Lesson"),("POST","Publish Admin Post"))):
        color=[GREEN,AMBER,RED][idx]
        button(d,409+idx*94,label,code,active==idx,color)
    d.line((82,713,638,713),fill="#2e5471",width=2)
    txt(d,88,735,"APP",22,MUTED,True)
    txt(d,340,735,"SERVER",22,MUTED,True)
    txt(d,538,735,"REPLY",22,MUTED,True)
    d.line((144,780,310,780),fill=CYAN,width=5)
    d.polygon([(310,772),(327,780),(310,788)],fill=CYAN)
    d.line((432,780,565,780),fill=CYAN,width=5)
    d.polygon([(565,772),(582,780),(565,788)],fill=CYAN)
    selected=active if active!=-1 else 0
    if state.endswith("request"):
        x=353; col=[GREEN,AMBER,RED][selected]
        d.ellipse((x-18,762,x+18,798),fill=col)
        d.ellipse((x-5,775,x+5,785),fill=WHITE)
    rect(d,(82,825,638,1081),"#101e30",r=18,stroke="#36556e")
    endpoint={
        "public_tap":"GET /lessons/public", "public_request":"GET /lessons/public","public_response":"GET /lessons/public",
        "private_tap":"GET /lessons/private","private_request":"GET /lessons/private","private_response":"GET /lessons/private",
        "admin_request":"POST /admin/publish","admin_response":"POST /admin/publish",
        "viewer_signed_in":"SESSION CHANGED: GUEST → VIEWER"
    }.get(state,"CHOOSE A SIMULATED REQUEST")
    textwrap(d,100,847,endpoint,21,CYAN,max_w=510,bold=True)
    data={
     "public_response":("200 OK","REQUEST SUCCEEDED",GREEN,"Lesson: API Basics", "✓"),
     "private_response":("401 UNAUTHORIZED","SIGN IN REQUIRED",AMBER,"Private content stays locked","LOCK"),
     "admin_response":("403 FORBIDDEN","VIEWER CANNOT PUBLISH",RED,"Admin permission required","STOP")
    }
    if state in data:
        status,meaning,col,explain,symbol=data[state]
        txt(d,104,901,status,35,col,True)
        textwrap(d,104,954,meaning,24,WHITE,max_w=500,bold=True)
        txt(d,104,1013,explain,18,MUTED)
        if symbol=="✓":d.ellipse((555,916,605,966),fill=GREEN);txt(d,566,916,"✓",29,"#0b2730",True)
        else:txt(d,555,914,"!",32,col,True)
    elif state.endswith("request"):
        txt(d,104,921,"SENDING REQUEST...",25,CYAN,True)
        txt(d,104,970,"APP → SERVER → RESPONSE",18,MUTED)
    elif state=="viewer_signed_in":
        txt(d,104,921,"USER IS NOW SIGNED IN",24,GREEN,True)
        txt(d,104,975,"Role: Viewer (not Admin)",19,MUTED)
    else:
        txt(d,104,925,"TAP A DEMO BUTTON",24,WHITE,True)
        txt(d,104,980,"All outcomes are simulated",19,MUTED)

def hook(d,step):
    txt(d,57,290,"YOUR API",40,MUTED,True)
    txt(d,57,354,"RETURNED...",37,WHITE,True)
    rect(d,(54,478,666,743),"#10273a",r=28,stroke="#4d7391")
    txt(d,104,511,"403",135,RED,True)
    txt(d,104,672,"FORBIDDEN",46,WHITE,True)
    if step=="codes":
        for i,(code,col) in enumerate([("200",GREEN),("401",AMBER),("403",RED)]):
            rect(d,(56+i*211,803,246+i*211,905),"#152e41",r=14,stroke=col)
            txt(d,97+i*211,820,code,45,col,True)
        txt(d,61,972,"DOESN'T ALWAYS MEAN BROKEN.",27,CYAN,True)
    else:
        txt(d,74,819,"WHAT DOES IT ACTUALLY MEAN?",26,CYAN,True)

def setup(d):
    txt(d,63,237,"THREE BUTTONS.",38,WHITE,True)
    txt(d,63,290,"THREE OUTCOMES.",34,CYAN,True)
    rect(d,(52,384,668,991),"#0d2338",r=28,stroke="#46728f")
    txt(d,94,427,"API STATUS LAB",32,WHITE,True)
    txt(d,93,485,"ROLE: GUEST",24,AMBER,True)
    button(d,552,"View Public Lesson","GET",False)
    button(d,667,"Open Private Lesson","GET",False)
    button(d,782,"Publish Admin Post","POST",False)
    txt(d,94,916,"NO REAL REQUESTS ARE SENT",21,MUTED,True)

def distinction(d,which):
    txt(d,56,266,"TWO QUESTIONS.",43,WHITE,True)
    txt(d,56,324,"NOT THE SAME THING.",29,CYAN,True)
    rect(d,(54,457,666,716), "#173b48" if which=="identity" else "#10293c",r=20,stroke=CYAN if which=="identity" else EDGE,width=3)
    txt(d,79,490,"AUTHENTICATION",31,CYAN,True)
    textwrap(d,80,561,"WHO ARE YOU?",44,WHITE,max_w=535,bold=True)
    txt(d,79,650,"401 → IDENTIFICATION",21,AMBER,True)
    rect(d,(54,760,666,1020), "#173b48" if which=="permissions" else "#10293c",r=20,stroke=GREEN if which=="permissions" else EDGE,width=3)
    txt(d,79,795,"AUTHORIZATION",32,GREEN,True)
    textwrap(d,80,865,"WHAT CAN YOU DO?",42,WHITE,max_w=535,bold=True)
    txt(d,79,957,"403 → ACCESS RULES",21,RED,True)

def recap(d,stage):
    txt(d,57,270,"SAVE THIS",60,WHITE,True)
    txt(d,58,349,"HTTP STATUS CHEAT SHEET",26,CYAN,True)
    rows=[("200","IT WORKED",GREEN),("401","AUTHENTICATE",AMBER),("403","NOT PERMITTED",RED)]
    for i,(code,label,col) in enumerate(rows):
        y=468+i*173
        active= i<({"200":1,"401":2,"403":3}[stage])
        rect(d,(55,y,665,y+137),"#173d49" if active else "#102337",r=18,stroke=col if active else "#34546c",width=3 if active else 2)
        txt(d,79,y+17,code,59,col if active else MUTED,True)
        txt(d,239,y+43,label,30,WHITE if active else MUTED,True)
    txt(d,58,1060,"WHICH ONE HAVE YOU SEEN?",22,CYAN,True)

def render_frame(i,item,dir_):
    start,end,mode,state=item
    im,d=base(i,mode)
    if mode=="hook": hook(d,state)
    elif mode=="setup":setup(d)
    elif mode=="app":app(d,state)
    elif mode=="distinction":distinction(d,state)
    elif mode=="recap":recap(d,state)
    else:raise ValueError(mode)
    file=dir_/f"shot_{i+1:02d}_{state}.png"
    im.save(file,optimize=True)
    return file

def probe_duration(path):
    out=subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(path)],text=True)
    return float(out.strip())

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--voice",required=True,help="Approved Fraser WAV/MP3 file")
    p.add_argument("--out",default="kairo_ml007_visual_v2_REVIEW.mp4")
    p.add_argument("--frames-dir",default=None)
    opts=p.parse_args()
    voice=Path(opts.voice).resolve();out=Path(opts.out).resolve()
    if not voice.is_file():raise SystemExit("Voice file not found: "+str(voice))
    vo=probe_duration(voice)
    if not 52<=vo<=68:raise SystemExit(f"Unexpected voice length: {vo:.2f}s")
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="kairo_ml007_v2_") as td:
        tdir=Path(td)
        frames=[render_frame(i,shot,tdir) for i,shot in enumerate(STATES)]
        if opts.frames_dir:
            dest=Path(opts.frames_dir);dest.mkdir(parents=True,exist_ok=True)
            for fr in frames:shutil.copy2(fr,dest/fr.name)
        manifest=tdir/"story.ffconcat"
        with manifest.open("w") as f:
            f.write("ffconcat version 1.0\n")
            for (start,end,*_),fr in zip(STATES,frames):
                f.write(f"file '{fr}'\nduration {end-start:.3f}\n")
            f.write(f"file '{frames[-1]}'\n")
        cmd=[
            "ffmpeg","-hide_banner","-loglevel","error","-y",
            "-f","concat","-safe","0","-i",str(manifest),
            "-i",str(voice),"-filter_complex","[0:v]fps=24,scale=720:1280,format=yuv420p[v]",
            "-map","[v]","-map","1:a:0","-t","59","-af","apad=pad_dur=1",
            "-c:v","libx264","-preset","veryfast","-crf","20","-r","24",
            "-c:a","aac","-b:a","160k","-movflags","+faststart",str(out)]
        subprocess.run(cmd,check=True)
    length=probe_duration(out)
    if not 58.5<=length<=59.3:raise SystemExit(f"Unexpected result length {length}")
    print(json.dumps({"file":str(out),"duration":round(length,3),"voice_sec":round(vo,3),"size_bytes":out.stat().st_size,"preview_only":True,"notes":"No new paid generations; simulated interface; captions to align manually"}),flush=True)
if __name__=="__main__":main()
