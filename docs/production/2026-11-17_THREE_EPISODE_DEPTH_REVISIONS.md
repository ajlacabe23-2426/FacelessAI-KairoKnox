# Nov 17 — Three Depth-Added Episode Revisions
Status: **scripts + timecoded shot plans ready for recording and rendering**, not completed/released MP4 masters. The earlier three 13.5-second videos remain unchanged as approved-style references. Their existing Benjamin narration is NOT sufficient for these longer scripts. Retain the proven voice delivery and smooth motion language; get an equivalent consistent full-length narration before claiming final video completion.

## 1. Micro Learning — The Password Isn't the Whole Lock
**Target:** 50–58 seconds. Audience payoff: explain why sessions exist, the difference from passwords, and what reduces risk.

Two hook options:
- **Consequence:** "A perfect password can still leave an account exposed."
- **Prediction:** "What do you think keeps you signed in after your password is checked?"

**Complete proposed narrator script**
> Your password isn't what keeps you signed in all day. When you first log in, a website checks your credentials. Then it often gives your browser a session identifier, usually stored in a cookie. Think of it as a wristband: you showed ID at the door, but the wristband lets you move around without showing ID every minute. As you open pages, your browser sends that session identifier back, and the service recognizes the active session. Here's the catch: if someone gets a valid active session credential, they may be treated as already signed in, even without knowing your password. Multi-factor authentication is important, but it doesn't automatically undo an exposed session. That's why services should protect cookies, expire sessions and invalidate them on logout. And you should review signed-in devices, keep your browser updated and sign out of unfamiliar sessions. Protect the wristband, not just the front door.

**Scene and explanation map**
| Time target | Beat | Visual cause-and-effect action | Spoken lesson |
|---|---|---|---|
| 0–3 s | Hook | Dark vault opens, then a second glowing wristband floats through | Password vs ongoing session |
| 3–12 s | Setup | Credential enters verified login server; token returns to browser | Website checks credentials once |
| 12–28 s | Mechanism | A browser opens two pages, each carrying a stylized cookie badge; server transitions request to AUTHORIZED | A session identifier maintains signed-in state |
| 28–39 s | Example | Two abstract browser windows with a copied credential, labeled "illustration — no real accounts"; second becomes ACTIVE | Exposed active credentials risk impersonation |
| 39–51 s | Action/limit | Defensive controls animate: secure cookie, expiration, logout revocation; user reviews sessions | Layers of protection; MFA alone not universal stop |
| 51–58 s | Close | Wristband returns to vault, now expires and disappears | Protect the whole session |

**Evidence:** OWASP Session Management Cheat Sheet, current reference, https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet . No real tokens, URLs containing sessions, attack procedure, account details or exploit demo.

## 2. Signal Kut — AI's Compressed Cyberattack Clock
**Target:** 50–60 seconds. Audience payoff: understand the *defense* problem created by compressed activity windows.

Two hook options:
- **Consequence:** "In some attacks, defenders had less than three hours."
- **Prediction:** "Can a security team respond before an automated intrusion finishes?"

**Complete proposed narrator script**
> On November thirteenth, the FBI warned about ARTEX, an AI-driven framework that malicious actors have used in cyber intrusions. In some reported cases, the activity moved from initial targeting to privileged access in under three hours. Here's why that matters. Security teams don't just need to spot a suspicious event. They must investigate it, confirm the risk and contain it before the next action happens. Automation can compress the time between those steps. Picture a business with a public-facing portal, older integrations and overly broad access permissions. One overlooked dependency could become the weak link. That is an illustration, not a reconstruction of an FBI case. The FBI recommends reducing unnecessary external exposure, limiting privileges, monitoring unusual identity and application activity, and strengthening protections around business APIs. This is not proof that every AI-driven attack will succeed. The lesson is that **response speed and preparation must improve together**. Signal Kut.

**Scene and explanation map**
| Time target | Beat | Visual cause-and-effect action | Spoken lesson |
|---|---|---|---|
| 0–4 s | Hook | Timer counts down from 03:00 with "IN SOME CASES" qualifier | Scope of FBI finding |
| 4–12 s | Setup | Original FBI-style report graphic, date and ARTEX name with source label | Verified advisory, not invented breaking alert |
| 12–27 s | Mechanism | Two parallel clocks: automated activity moves rapidly, defender sequence DETECT -> TRIAGE -> CONTAIN animates with lag | Defense window compression |
| 27–42 s | Example | Clearly labeled "HYPOTHETICAL" topology: public portal, partner integration, permissions; weak link flagged, NOT actual intrusion instructions | Why exposed peripheral services and broad access matter |
| 42–55 s | Action | Animate service inventory, least privilege and monitoring controls as barriers | Actionable defensive practices |
| 55–60 s | Close | Clock freezes at "PREPARED" / title | Speed vs preparation |

**Evidence:** FBI FLASH, "Threat Overview of ARTEX Autonomous Penetration Testing Framework," November 13, 2026, https://www.ic3.gov/CSA/2026/261113.pdf . "Under three hours" describes **some intrusions**, not an industry average or a prediction. Avoid actual adversary TTP demonstrations.

## 3. Kairo Knox — The Update That Stopped the World
**Target:** 60–68 seconds. Audience payoff: understand why a small affected-device percentage can have major operational consequences.

Two hook options:
- **Consequence:** "Less than one percent of computers. Worldwide disruption."
- **Prediction:** "How could one faulty update interrupt entire industries?"

**Complete proposed narrator script**
> In July twenty twenty-four, a faulty CrowdStrike security update caused Windows systems to crash. Airlines, hospitals and other businesses experienced disruptions. Microsoft estimated that eight point five million Windows devices were affected: fewer than one percent of Windows machines. So why was the impact so large? Because computers do not all have the same job. One system might handle check-in, another coordinates critical services and another connects a business to its customers. When important systems fail together, the effects spread through the services that depend on them. This was not a cyberattack. It was a reliability failure in software meant to help protect computers. The right lesson is not to stop updating. It is to make change safer: stage rollouts, test recovery, keep operational fallbacks and rehearse response plans. A small percentage can carry an enormous share of the world's dependencies. I'm Kairo Knox. Design for failure.

**Scene and explanation map**
| Time target | Beat | Visual cause-and-effect action | Spoken lesson |
|---|---|---|---|
| 0–4 s | Hook | Original masked Kairo in low-light shot; "LESS THAN 1%" turns into disrupted network | Surprise without false visual evidence |
| 4–14 s | Setup | July 2024 date, patch file, Windows device matrix; "FAULTY UPDATE, NOT HACK" | The triggering event |
| 14–26 s | Evidence | 8.5M number shrinks into <1% sector; cite Microsoft July 20 report | Accurate scale and bounded statistic |
| 26–46 s | Mechanism | Animated graph with airline desk, service desk and business systems linked by dependencies; critical nodes stop, secondary services dim | Cascading operational dependencies |
| 46–60 s | Action | Staged deployment rings, restore test and alternative process reveal | Resilience and recovery |
| 60–68 s | Close | Matched opening graph stabilizes as Kairo gives answer | Design for failure |

**Evidence:** Microsoft Official Blog, July 20, 2024, https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/ . Context is a 2024 historical case, not current breaking news. Images of hypothetical network dependency are explanatory illustrations, not a diagram from incident forensics.

## Recording, editing and release gates
- **Voice:** user liked the prior natural Benjamin delivery. Preserve that voice character and cadence if the service can supply the new full voice track. Do not quietly switch to Ainsley, Kokoro or another speaker while claiming voice continuity. No modulation or heavy voice effects.
- **Cuts:** preserve natural continuity, tracking objects across neighboring shots; never add jump cuts solely because a subtitle changed.
- **Visual demonstrations:** all three must have a visible cause-effect diagram in their center, not just a narrator over abstract graphics.
- **Production dependency:** new narration for the expanded material is not yet rendered. Previous 13.5-second MP4s are unchanged; new runtime claims above are **targets**. Credit restrictions at the Nov 17 review blocked new paid voice generations. Code-first visual animation can be authored without purchased video credits.
- **Release:** NO-GO for publishing any revised full episode before rendered whole-video review and explicit per-platform approval.
