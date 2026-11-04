#!/usr/bin/env python3
"""Render private Kairo Knox editorial review cuts from own voice/B-roll plus original cards.
Requires Pillow and ffmpeg/ffprobe. Never publishes or copies third-party footage.
Run: python3 scripts/render_kairo_slate.py --dir /home/user/kairo_sprint_20261104
"""
import argparse, math, json, os, re, subprocess, tempfile, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W,H=760,1340
BG=(5,11,22)
C=(94,217,255)
WHITE=(236,245,251)
MUTED=(159,185,205)
SLATES={
'ep13': {
'kind':'CORE EPISODE 013','title':'THE AI SHOPPING TRAP','voice':'ep13_voice.wav','broll':'ep13_intro.mp4',
'slides':[
('AI HAS AN ANSWER','BUT IS IT YOUR ANSWER?',['$29.99', '$359+'],'ILLUSTRATIVE WATCH PRICES'),
('THE CHEAPEST OPTION','ISN\'T THE RIGHT ONE',['GPS reliability','Battery life','Warranty + support'],'COMPARE YOUR ACTUAL NEEDS'),
('THE PROMPT IS THE FILTER','WHO SET YOUR PRIORITIES?',['Define your criteria','Check the evidence','Inspect trade-offs'],'A RANKING IS NOT A DECISION'),
('MORE PEOPLE USE AI','FOR SHOPPING RESEARCH',['51% of surveyed U.S. consumers','reported AI-shopping use'],'SOURCE: NIELSENIQ · SEP 2026'),
('RECOMMENDATION ≠ PURCHASE','YOU STILL CHOOSE',['Criteria','Evidence','Trade-offs'],'GARTNER SURVEY: PURCHASE COMFORT LOWER'),
('WHO IS RESPONSIBLE','FOR THE FINAL CHOICE?',['You?','Or your algorithm?'],'KAIRO KNOX · THINK BEFORE YOU CLICK')],
'captions':[
'I asked an AI to find me a hiking watch.','It put a twenty-nine dollar ninety-nine option beside one costing more than three hundred fifty-nine dollars.','Big price difference. But here is what the recommendation did not settle: which one actually fits my trip?','If I need reliable GPS, battery life, and a warranty, the cheapest headline price tells me almost nothing.','Nielsen I Q says more than half of surveyed U.S. shoppers recently used AI to help them shop.','But a separate Gartner survey found far less comfort with letting AI make the purchase.','That is the missing step. AI can rank options; it cannot decide what matters to you unless you tell it.','Before you buy, check the criteria, the source, and the trade-offs.','So who is responsible for the final decision? You, or your algorithm?']},
'ep14':{
'kind':'CORE EPISODE 014','title':'THE VISITORS WHO WEREN\'T HUMAN','voice':'ep14_voice.wav','broll':'ep14_intro.mp4',
'slides':[
('THE STREETS ARE EMPTY','THE TRAFFIC ISN\'T',['NO PEOPLE IN SIGHT','DIGITAL VISITORS ARRIVING'],'FICTIONAL VISUALIZATION'),
('5.2 MILLION','AGENT-ASSOCIATED SESSIONS',['230,511 Clarity projects','Aug 13 - Sep 9, 2026'],'SOURCE: MICROSOFT CLARITY · OCT 29, 2026'),
('WHAT DID SESSIONS SHOW?','RECORDED WEB EVENTS',['Searches and form submits','Bookings and checkout events'],'NOT PROOF OF AUTONOMOUS COMPLETION'),
('CRITICAL DISTINCTION','A SESSION IS NOT AN AGENT',['Human handoffs may occur','Events do not prove purchases'],'SOURCE LIMITATION: CLARITY METHODOLOGY'),
('THE INTERNET IS CHANGING','VISITORS AREN\'T ALWAYS HUMAN',['Design for people','Account for agents'],'CONCEPTUAL ILLUSTRATION'),
('WHO IS AT THE DOOR?','WHO ARE YOU SERVING?',['Humans','Agents','Both'],'KAIRO KNOX · INVESTIGATE THE SIGNAL')],
'captions':[
'At midnight, every storefront is empty.','Yet the visitor counter keeps climbing.','Who is browsing? Not always humans.','Microsoft Clarity studied over five point two million website sessions involving AI agents, across more than two hundred thirty thousand projects.','Some recorded searches, forms, appointment bookings, and checkout events.','But there is an important limit: a session involving an agent can also include a human taking over.','A checkout event is not proof that a machine independently completed a purchase.','Still, the web is meeting a different kind of visitor: software navigating toward a goal on somebody else\'s behalf.','Imagine a website built to persuade a person. What changes when its next visitor is an agent?','And how will a business know whether it served a customer, a helpful assistant, or a mistake?','When the visitor is not always human, the internet needs a new way to understand who is at the door.','If AI explores the web for you, what will you stop seeing?']},
'signal004':{
'kind':'SIGNAL CUT 004','title':'THE ROBOT HAS A CONTRACT','voice':'signal_voice.wav','broll':'signal_intro.mp4',
'slides':[
('HUMANOID ROBOTS','HAVE ENTERED WAREHOUSES',['An actual commercial story','Not just a viral demo'],'KAIRO KNOX · SIGNAL CUT'),
('GXO + AGILITY','EXPANDED PARTNERSHIP',['Announced Oct 26, 2026','Two additional U.S. sites'],'ADDITIONAL DEPLOYMENTS PLANNED IN 2027'),
('STAGE 01','DEMONSTRATION',['Can it do the task?','Under what conditions?'],'A DEMO IS NOT SCALE'),
('STAGE 02','DEPLOYMENT',['Does it work in operations?','What support is required?'],'CURRENT OPERATIONS MATTER'),
('STAGE 03','REPEATABLE SCALE',['Multiple sites','Many shifts + real uptime'],'MEASURE WHAT WORKS, NOT JUST WHAT LOOKS COOL'),
('VIRAL TRICK?','OR RELIABLE WORK?',['Safety','Interventions','Throughput'],'WHICH EVIDENCE WOULD YOU TRUST?')],
'captions':[
'Humanoid robots are not just dancing for cameras anymore.','On October twenty-sixth, GXO and Agility Robotics announced plans to expand Digit robot deployments into more U.S. warehouse sites in twenty twenty-seven.','That is a real commercial signal. But pause before calling it a robot takeover.','One viral demo shows what a machine can do once.','A deployment tests whether it can work around real warehouse operations.','Scaling asks the harder question: can it keep delivering useful work safely, across sites and shifts?','When somebody says robots are replacing everybody, check the stage: demonstration, operational deployment, or repeatable scale.','Those are three very different headlines.','Would you rather see a spectacular robot trick, or a boring eight-hour reliability report?']},
'ml007':{
'kind':'MICRO LEARNING 007','title':'ONE API. THREE RESPONSES.','voice':'ml_voice.wav','broll':None,
'slides':[
('ONE API','THREE RESPONSES',['200 OK','401 Unauthorized','403 Forbidden'],'A SAFE, OFFLINE DEMONSTRATION'),
('200','OK',['GET /lessons/public','Request succeeded'],'SIMULATED API RESPONSE'),
('401','UNAUTHORIZED',['GET /lessons/private','Guest has no valid login'],'AUTHENTICATION REQUIRED'),
('403','FORBIDDEN',['POST /admin/publish','Viewer is not an admin'],'PERMISSION DENIED'),
('WHO ARE YOU?','WHAT CAN YOU DO?',['Authentication = identity','Authorization = permissions'],'NOT THE SAME THING'),
('SAVE THIS','3-CODE CHEAT SHEET',['200 = It worked','401 = Authenticate','403 = Not permitted'],'SOURCE: MDN HTTP RESPONSE STATUS')],
'captions':[
'Your app makes a request to an API.','The server sends back a number. Watch what happens.','First, our simulated app requests a public lesson. Two hundred, O K. The request worked.','Next, we try to open a private lesson without signing in. Four oh one: we need valid authentication.','Now we sign in as a viewer, but try an admin-only action. Four oh three: forbidden.','We have an identity, but do not have the permission. That is authentication versus authorization in seconds.','When a request fails, ask two questions. Did the server recognize who I am?','And is that identity allowed to do this?','This is a safe, offline demonstration, not a live server.','Save these three codes: two hundred, four oh one, four oh three. Which one have you seen in the wild?']}}
def run(cmd):
    subprocess.run(cmd,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
def duration(p):
    try:
        s=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(p)],text=True)
        return float(s.strip())
    except Exception: return 0
def font(sz,bold=False):
    fonts=(['/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else ['/usr/share/fonts/truetype/montserrat/Montserrat-Regular.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'])
    for f in fonts:
        if os.path.exists(f): return ImageFont.truetype(f,sz)
    return ImageFont.load_default()
def wrap_lines(d,txt,ft,maxwidth):
    words=txt.split()
    lines=[]; curr=''
    for word in words:
        trial=(curr+' '+word).strip()
        if d.textbbox((0,0),trial,font=ft)[2]>maxwidth and curr:
            lines.append(curr);curr=word
        else:curr=trial
    if curr:lines.append(curr)
    return lines
def write_lines(d,txt,x,y,ft,fill,width,leading=1.23):
    for line in wrap_lines(d,txt,ft,width):
        d.text((x,y),line,font=ft,fill=fill)
        y+=round(ft.size*leading)
    return y
def paint(slide,entry,index,root):
    title,subtitle,points,source=slide
    im=Image.new('RGB',(W,H),BG); px=im.load()
    for y in range(H):
        glow=1-(abs(y-H*.34)/(H*.88))
        for x in range(W):
            vig=max(0,1-math.sqrt(((x-W*.44)/(W*.8))**2+((y-H*.16)/(H*.9))**2))
            factor=max(0,glow)*.15+vig*.13
            px[x,y]=(int(4+factor*37),int(11+factor*64),int(22+factor*91))
    d=ImageDraw.Draw(im)
    for i in range(0,12):
        y=245+i*91
        d.line((42,y,W-42,y-29),fill=(14,36,57),width=1)
    d.rounded_rectangle((40,40,W-40,118),radius=19,fill=(9,26,45),outline=(47,98,131),width=2)
    d.text((63,65),'KAIRO / KNOX',font=font(27,True),fill=WHITE)
    d.text((W-122,69),f'{index+1:02d} / 06',font=font(17,True),fill=(102,166,196))
    d.line((64,162,W-64,162),fill=C,width=4)
    d.text((65,187),entry['kind'],font=font(18,True),fill=(92,215,255))
    yy=285
    yy=write_lines(d,title,62,yy,font(56,True),WHITE,W-125,1.13)
    yy+=31
    yy=write_lines(d,subtitle,62,yy,font(29,True),(119,224,250),W-125,1.3)
    box_top=max(580,yy+70)
    box_bottom=min(H-245,box_top+min(380,115+len(points)*74))
    if box_bottom<box_top+140: box_bottom=box_top+140
    d.rounded_rectangle((60,box_top,W-60,box_bottom),radius=24,fill=(8,25,43),outline=(49,116,149),width=2)
    yy=box_top+34
    for p in points:
        d.rounded_rectangle((84,yy+6,99,yy+21),radius=4,fill=(83,213,247))
        yy=write_lines(d,p,116,yy,font(29,True),WHITE,W-190,1.2)+24
    d.line((62,H-193,W-62,H-193),fill=(48,87,118),width=2)
    write_lines(d,source,63,H-173,font(18,True),MUTED,W-122,1.35)
    d.text((63,H-88),'RESEARCH  /  ANALYSIS  /  SYSTEMS',font=font(15,True),fill=(84,160,192))
    output=root/f'{entry["filename"]}_{index+1:02d}.png'
    im.save(output,optimize=True)
    return output
def ts(t):
    ms=round(t*1000)
    return f'{ms//3600000:02d}:{(ms//60000)%60:02d}:{(ms//1000)%60:02d},{ms%1000:03d}'
def captions(subs,dur,file):
    words=[max(2,len(s.split())) for s in subs]; tot=sum(words);pos=0
    with open(file,'w') as f:
        for i,(txt,n) in enumerate(zip(subs,words),1):
            nxt=dur if i==len(subs) else (pos+n/tot*dur)
            f.write(f'{i}\n{ts(pos)} --> {ts(nxt)}\n{txt}\n\n')
            pos=nxt
def render(name,entry,root):
    entry=dict(entry);entry["filename"]=name
    voice=root/entry['voice']
    if not voice.exists():raise FileNotFoundError(f'Voiceover missing: {voice}')
    dur=duration(voice);assert dur>20, f'Bad voice track {voice}'
    cards=[paint(slide,entry,i,root) for i,slide in enumerate(entry['slides'])]
    extra=0.6
    segment=(dur+extra)/len(cards)
    manifest=root/f'{name}_slides.ffconcat'
    with manifest.open('w') as f:
        f.write('ffconcat version 1.0\n')
        for c in cards:
            f.write(f"file '{c}'\nduration {segment:.3f}\n")
        f.write(f"file '{cards[-1]}'\n")
    srt=root/f'{name}.srt'
    captions(entry['captions'],dur,srt)
    output=root/f'kairo_{name}_REVIEW.mp4'
    broll=root/entry['broll'] if entry['broll'] else None
    filtered="[0:v]fps=24,crop=720:1280:x='20+10*sin(n/75)':y='30+9*cos(n/63)',setpts=PTS-STARTPTS[base];"
    audioindex=1
    inputs=['-f','concat','-safe','0','-i',str(manifest),'-i',str(voice)]
    if broll and broll.exists():
        inputs.extend(['-i',str(broll)])
        filtered+="[2:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=24,trim=duration=5,setpts=PTS-STARTPTS[broll];[base][broll]overlay=0:0:enable='between(t,0,5)':eof_action=pass[v];"
    else:
        filtered+='[base]format=yuv420p[v];'
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y']+inputs+['-filter_complex',filtered,'-map','[v]','-map',f'{audioindex}:a:0','-t',str(dur+.65),'-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-r','24','-c:a','aac','-b:a','128k','-movflags','+faststart','-shortest',str(output)]
    run(cmd)
    info={'name':name,'duration_s':round(duration(output),2),'video':str(output),'voice_duration_s':round(dur,2),'srt':str(srt),'broll_used':bool(broll and broll.exists())}
    print(json.dumps(info),flush=True)
    assert output.exists() and output.stat().st_size>200000, f'Bad output {output}'
    return output
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--dir',default='.')
    args=ap.parse_args();root=Path(args.dir).resolve();root.mkdir(parents=True,exist_ok=True)
    result=[]
    for key,val in SLATES.items():
        result.append(render(key,val,root))
    import zipfile
    z=root/'Kairo_Knox_2026-11-04_Private_Review_Package.zip'
    with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as ar:
        for p in result:ar.write(p,p.name)
        for p in root.glob('*.srt'):ar.write(p,p.name)
    print(json.dumps({'zip':str(z),'size_mb':round(z.stat().st_size/1e6,1)}),flush=True)
if __name__=='__main__':main()
