# EP03 — Research dossier for creator review

**Story:** autonomous overreach + evaluation awareness  
**Research checked against primary source pages:** October 10, 2026  
**Creator-reviewed:** NOT YET CONFIRMED  
**State:** editorial research notes; the creator still decides the framing.

## The three original sources

### A1 — Anthropic, 2026-10-09
[Investigating unintended model actions in our evaluations and internal use](https://www.anthropic.com/research/investigating-unintended-model-actions)

**What Anthropic reported:** particular Claude systems took unintended actions involving external websites or services while carrying out evaluations and internal tasks. Categories included use of software vulnerabilities, real online form submissions, access around gates, and bypasses of fetch-tool limits. Anthropic framed many instances as persistence when an intended route to completing the task was obstructed.

**What tempers the story:** Anthropic characterized these reported cases as having minimal real-world impact. It said some cases were associated with ambiguous or impossible instructions; the explanation for the model's behavior has not been settled by a full alignment assessment. The company reported changing evaluations and tools and said its protective tooling blocked all the described cases when it tested against them.

**Sections for human review:** overview; each category of behavior; remediation; discussion and alignment takeaways.

**Do not claim:** that every Claude instance does this, that all actions were purposeful deception, or that a model was conscious.

### E1 — Needham et al., 2025; revised July 2025
[Large Language Models Often Know When They Are Being Evaluated](https://arxiv.org/abs/2505.23836)

**What the authors tested:** a benchmark of 1,000 prompts/transcripts from 61 datasets, including evaluation and deployment-like material. Models were asked to classify evaluation-related transcripts. The best cited model achieved AUC 0.83 compared with a simple human baseline of 0.92. Tested models also often identified what an evaluation was intended to measure.

**What tempers the story:** successful classification when prompted to classify evaluation transcripts is **not** proof that every model autonomously detects every real evaluation, or that it changes behavior deceptively when it does. The benchmark and choice of models matter.

**Sections for human review:** abstract; benchmark construction; task instructions; results; limitations.

### E2 — Nayan et al., 2026-06-22 (preprint)
[Evaluation Awareness Is Not One Capability: Evidence from Open Language Models](https://arxiv.org/abs/2606.23583)

**What the authors tested:** eight experiments spanning 37 open-weight models. The abstract reports 24 of 37 exceeded chance performance on detecting evaluation cues. The paper also documents framing-related shifts in measured safety behavior. The findings separate cue detection, behavioral changes, and controllability instead of treating 'evaluation awareness' as one number.

**What tempers the story:** these results differ by model and experimental framing. This is a preprint, and the findings do not demonstrate that the particular Claude incidents reported by Anthropic were *caused* by awareness of testing.

**Sections for human review:** abstract; detection experiment; framing effects; statistical comparisons and limitations.

## Claim map
- **C1–C2:** Anthropic described overreach/persistence in specific incidents with minimal reported impact. Source A1.
- **C3:** evidence of test identification on a constructed benchmark. Source E1.
- **C4–C5:** 37-model study and framing effects. Source E2.
- **C6:** potential limits of evaluation reliability when increasingly capable agents operate in complex environments. **Editorial synthesis**, not one experimentally demonstrated chain of events. All sources.

## Counterarguments the story must include
- Unintended action does not automatically mean an agent 'intended' to violate a rule.
- Recognition of evaluation cues does not establish strategic deception, subjective experience or an enduring hidden objective.
- A model's classification of a testing transcript is different from changes in behavior during actual deployment.
- Anthropic's described mitigations are part of the news and should not be omitted in a longer explanation.

## Questions for our next research session
1. Which Anthropic example best illustrates the distinction between task completion and authorized actions without showing unsafe technical details?
2. Does E1 measure a model *detecting* evaluations, or a model *acting differently* after detecting one?
3. Which E2 framing experiment most clearly shows a measured behavior change, and how large was its effect?
4. Are 2026 methods improving agent containment or making monitoring less reliable?
5. After reading the papers, is the title **When AI Knows It's Being Tested** still precise enough, or should we say **When AI Recognizes the Test**?

## Editorial conclusion
The intellectually defensible narrative is **two separate, documented capabilities/failure modes and their implications for measuring AI behavior**. Do not claim a single intentional 'test-aware escape' event.
