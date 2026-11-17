# Explanation Depth v1 — Kairo Knox / Micro Learning / Signal Kut
Status: **proposed production standard / private review**. Date: 2026-11-17.

## Intent and preserved wins
The Nov 17 three 13.5-second proof-of-concept cuts received positive owner feedback for the **natural, intelligible narrator** and **seamless cuts**. Do not replace either when expanding. Those cuts are the preserved reference/control, NOT release-approved full episodes. Originality, accurate sources, the masked Kairo identity, and separate final approval still apply.

**Depth is not length.** It is whether a viewer can answer:
1. What happened / what is this?
2. How does the mechanism work (input -> process -> output)?
3. Why does this mechanism cause the claimed consequence?
4. What does a real or explicitly illustrative example show?
5. What can someone do with this knowledge, and what is the important limitation?

## Required explanation beats (each has a distinct narrative and visual job)
| Beat | Approx. share | Narration purpose | Visual action and proof |
|---|---:|---|---|
| Consequence hook | 0–7% | Promise a concrete, truthful outcome or paradox in first 2 seconds | Show outcome first; no pre-title |
| Familiar setup | 7–20% | Define one object using language a novice recognizes | Introduce two labeled entities; keep vocabulary accessible |
| Mechanism demonstration | 20–52% | Show ordered cause -> mechanism -> result | Animate meaningful state changes and information flow, not merely moving text |
| Specific example + evidence | 52–74% | Prove the point with a sourced event or labeled hypothetical | Highlight the decisive step, number or dependency; include source/year and uncertainty |
| Action + limitation | 74–93% | Give a defensible takeaway; prevent overstated conclusion | Side-by-side harmful/safer comparison or actionable checklist |
| Loop / earned closing | 93–100% | Return to the question and answer it in one memorable line | Match the opening visual motif; minimal brand tag |

Durations are editorial estimates, not rigid scene quotas. Prefer ~45–65 seconds when a real explanation justifies it. Do not stretch a weak idea or cut necessary caveats to satisfy runtime.

## Audience progression — intelligent but accessible (v1.1)
**Editorial center of gravity:** topics should demand *one meaningful inference* from an interested viewer. Target the curious, capable non-expert who enjoys solving a problem—not someone seeking dictionary definitions, and not an expert certification lecture. No patronizing, “everyone knows this,” or empty jargon.

### Three levels (not three audience categories)
- **Level 2: Counterintuitive foundations.** Use a familiar thing to uncover a hidden rule, e.g., “Why a password is not the same as an authenticated session.” 10–20% of videos, usually as prerequisites.
- **Level 3: Systems thinking — DEFAULT.** Connect **two mechanisms**, show their interaction and one failure mode or tradeoff, e.g., session credential + access scope, automation + incident-response window, update deployment + critical dependency. ~60–70% of releases.
- **Level 4: Strategic consequences.** A sophisticated but demonstrable decision: risk vs convenience, least privilege vs business workflow, reliability vs rollout speed, LTV vs churn. ~15–25% of releases; make the technical system visible before discussing strategy.

Percentages are programming targets, **not** proven audience or algorithm preferences. Do not force the mix when evidence or useful stories are missing. Mark each episode L2/L3/L4 in its creative brief; don't label it “beginner/intermediate” in the video.

### Curiosity -> understanding -> insight
A successful episode asks a fair question that initially requires a little thought, then moves from familiar analogy to actual mechanism, reveals a *non-obvious dependency or tradeoff*, and gives an example in which the viewer could mentally predict the outcome. The payoff is **“Now I see why.”**

**Production requirements:**
- Start with a real dilemma, not “What is [term]?”
- Teach at most two necessary new technical terms; first explain them visually.
- Include **one cognitive turn**: a counterexample, failed assumption, second-order effect, conditional choice, or tradeoff. Show two possible outcomes if appropriate.
- Show why the causal link works and where the explanation stops; never replace the mechanism with rhetoric or unsupported “always.”
- Close with an *earned question or implication* that is naturally developed in the next installment, not artificial “part 2 to learn the answer” bait.
- Each episode must stand alone. Include a 3–5-second prerequisite recap only when needed. A sequence should reward return viewers, not punish newcomers.

### Planned connective topic tracks (illustrative, not automatically approved releases)
| Track | L2: entry paradox | L3: deeper system | L4: worthwhile tradeoff |
|---|---|---|---|
| Identity & cybersecurity | Why password verification isn't the same as a lasting login | How session credentials, OAuth delegated permissions and scopes differ | How access boundaries and revocation design change blast radius |
| Defensive intelligence | Why the *same* alert matters differently under compressed timelines | How telemetry, triage, identity risk and containment depend on each other | When to prioritize automation, guardrails or analyst investigation |
| Reliability & business | Why a small outage fraction can disable big services | How staged rollouts, shared dependencies and failover interact | The economics of redundancy vs downtime, with illustrative numbers |
| Cloud & APIs | Why APIs throttle otherwise-valid requests | How backpressure, queues, retries and idempotency interact | How reliability and cost change with scale |
| AI agents & identity | Why an assistant responding is different from an agent taking action | How tool privileges, authorization and human review constrain agents | Delegation boundaries, auditability and speed vs security |
| Business decisions | Why reported profit does not equal spendable cash | How working capital, payment timing and growth can create a cash crunch | When to optimize growth, margin or cash resilience |

These are *editorial pitches*, not completed research, scripts, production approval or verified claims. Verify current facts and high-stakes claims before each episode. For fictional examples, show the illustrative status conspicuously.

**Quality gate added:** a reviewer should be able to state (i) one previously hidden mechanism, (ii) one consequential tradeoff or failure mode, and (iii) one new question the episode equips them to investigate. If only a definition can be recalled, the concept is too shallow for the default L3 lane.

## Hard editorial gates
- Every factual claim with a number or causality needs a dated, trustworthy source. Label a dramatization as an illustration; do not portray it as historical footage.
- A real mechanism **must visibly change state**, e.g., signed-out -> verified -> session issued -> authenticated requests; or update -> critical dependency unavailable -> downstream service impact.
- Every 8–12 seconds, aim for a meaningful *idea progression*, not an arbitrary jump cut. Smooth transitions must preserve spatial relationships, visual identity and audio continuity.
- Show input, output, and failure/limit for teaching examples. One new term at a time; define necessary jargon in speech or context.
- On-screen text should summarize the spoken claim, not cover the central diagram. Keep it phone-safe, ~6–10 primary words per explanatory panel, with generous readability.
- Prefer diagram/animation choreography (cause-and-effect arrows, state highlights, split-screen contrasts, annotated details). Reject decorative zooms, still-image pans and unreadable dense graphics.
- Narration stays natural and consistent with the approved voice; do not insert robotic modulation or silently substitute voices. Do a complete **human listening pass** before release, not merely an audio-codec check.
- New narration requires a newly approved voice recording/generation. **Do not loop or stretch the 10-second reference narration to masquerade as a 60-second explainer**. The Nov 17 cuts can remain as promotional hooks until the full voice track is recorded.
- Kairo Knox: keep the approved masked identity; a generic silhouette is a temporary stand-in only, never a final character-continuity pass.
- Signal Kut: distinguish what an official report *states* from a hypothetical illustration or interpretation; be explicit about cases, dates, and scope.
- Publish only after verified full media review and explicit human approval; never infer it from draft acceptance, rendered file or test result.

## Concrete quality review questions
1. A viewer new to the topic can explain the mechanism without specialist vocabulary.
2. The visual proof supports the narration, instead of repeating captions.
3. There is a specific example that **does not** imply more than the evidence establishes.
4. The implication or action is non-generic and fits the real problem.
5. Every camera move maintains comprehension; the cuts feel natural.
6. All speech, music and captions stay legible together; no clipped, distorted or missing audio.
7. Source/copyright/permissions, character identity, 9:16 crop and whole-duration MP4 review are complete.

## Retention measurement plan (NOT observed performance)
Test a depth-added cut against the preserved 13.5-second proof-of-concept only after comparing appropriate lengths and clearly labeling the confound. Better: test two otherwise-similar full-length variants changing just the explanatory mechanism scene. Measure platform-verified three-second hold, average watch duration, percentage viewed, retention around mechanism demonstration, shares and saves, using comparable ages. A better explanation is a **hypothesis**, not a promise of more views.

## Handoff format
Each episode must have two verified hooks (consequence-first and prediction-first), a 6-beat storyboard, the exact narration with pacing estimates, a source/claim map, animation state map, visual permissions, a full-length quality checklist, a voice recording status and explicit publication status. The three Nov 17 revised examples are in `2026-11-17_THREE_EPISODE_DEPTH_REVISIONS.md`.
