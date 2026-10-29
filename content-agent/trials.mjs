// Descript handoff and Instagram Trial Reels lifecycle. Never connects or publishes autonomously.
import {ratePerThousand,validateSegments} from "./analysis.mjs";
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const hasUrl=u=>typeof u==="string"&&/^https:\/\/(?:www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/.test(u);
const fail=s=>{throw new Error(s);};
const getTrial=e=>e?.trial??{};
function checkedComposition(c,name) {
  if(!c)return {kind:name,connected:false,verified:false,reason:"Descript composition not supplied; manual work pending"};
  const coverage=finite(c.duration_seconds)&&c.duration_seconds>0?validateSegments(c.duration_seconds,c.transcript_segments||[]):{complete:false,gaps:[],reason:"no duration"};
  const valid=!!c.composition_id&&c.media_verified===true&&c.source_map_verified===true&&coverage.complete;
  return {kind:name,connected:!!c.composition_id,verified:valid,composition_id:c.composition_id??null,
    duration_seconds:c.duration_seconds??null,transcript_coverage:coverage,
    original_source_id:c.original_source_id??null,source_map_id:c.source_map_id??null};
}
export function prepareTrial(experiment,{control=null,test=null,comparison=null}={}) {
  if(!experiment?.experiment_id)fail("experiment_id required");
  if(experiment.status==="closed")fail("Closed experiments cannot be reused");
  if(experiment.status!=="reviewed")fail("Only reviewed experiments may be prepared for an edit trial");
  if(!Array.isArray(experiment.variants)||experiment.variants.length!==2)fail("Exactly two verified sibling source variants needed");
  if(experiment.variants.some(v=>v.media_verified!==true||v.source_map_verified!==true))fail("Both source files and source-to-cut maps must be verified");
  const notes=experiment.variants.flatMap(v=>(v.edit_notes||[]).filter(n=>n.action==="CHANGE"||n.action==="CUT").map(n=>({...n,variant_id:v.variant_id})));
  for(const note of notes){
    if(!finite(note.start)||!finite(note.end)||note.start<0||note.end<=note.start||!["EDIT-ONLY","RE-RECORD"].includes(note.method))fail("Edit notes require exact timestamps and edit method");
    if(typeof note.words!=="string"||!note.words.trim())fail("Edit notes require original exact words");
  }
  const comp={control:checkedComposition(control,"control"),test:checkedComposition(test,"test")};
  const validComparison=comparison&&finite(comparison.comparison_age_hours)&&comparison.comparison_age_hours>0&&
    finite(comparison.minimum_views)&&comparison.minimum_views>0&&
    ["test_higher_retention","test_higher_saves_per_1000"].includes(comparison.pass_rule);
  return {experiment_id:experiment.experiment_id,status:"reviewed",
    proposed_edit_notes:notes,recording_list:notes.filter(n=>n.method==="RE-RECORD").map(n=>({start:n.start,end:n.end,existing_words:n.words,instruction:n.instruction??null})),
    compositions:comp,comparison:validComparison?comparison:null,
    ready_for_private_trial:comp.control.verified&&comp.test.verified&&!!validComparison,
    blockers:[...(comp.control.verified?[]:["control composition must be verified"]),
      ...(comp.test.verified?[]:["test composition must be verified"]),
      ...(validComparison?[]:["comparison age/minimum views/pass rule must be set"])],
    instructions:["Edit the original private Descript project; keep verified source maps and preserve unchanged parts.",
      "Export both final private cuts for human review. Do not publish Descript share links.",
      "Confirm Instagram Trial Reels eligibility in the account before manual posting.",
      "Only user-supplied posted URLs can advance reviewed to trial."]};
}
export function registerTrialPosts(experiment,{control_url=null,test_url=null,control_post_id=null,test_post_id=null}={}){
  if(!experiment?.experiment_id||experiment.status==="closed")fail("Valid non-closed experiment required");
  if(!["reviewed","trial"].includes(experiment.status))fail("Cannot post before review");
  const trial=getTrial(experiment);
  const urls={control_url:control_url??trial.control_url??null,test_url:test_url??trial.test_url??null};
  const ids={control_post_id:control_post_id??trial.control_post_id??null,test_post_id:test_post_id??trial.test_post_id??null};
  const both=hasUrl(urls.control_url)&&hasUrl(urls.test_url)&&urls.control_url!==urls.test_url&&
    !!ids.control_post_id&&!!ids.test_post_id&&ids.control_post_id!==ids.test_post_id;
  // URLs are user-provided records, not independently verified against Instagram.
  return {...experiment,status:both?"trial":"reviewed",trial:{...trial,...urls,...ids,
    urls_recorded:both,provider_verified:false},blocking_reason:both?null:"two distinct Instagram trial URLs and post IDs required"};
}
export function recordTrialObservation(experiment,{variant,observation}){
  if(experiment?.status!=="trial")fail("Trial must be in trial state");
  if(!["control","test"].includes(variant))fail("variant must be control or test");
  if(!observation||!observation.collected_at||!observation.published_at||!finite(observation.views))fail("Dated views from same provider response required");
  if(observation.saves!=null&&!finite(observation.saves))fail("Invalid saves value");
  const trial=getTrial(experiment),records={...(trial.observations||{})};
  const key=observation.source+"|"+observation.post_id+"|"+observation.source_timestamp;
  if(!observation.source||!observation.post_id||!observation.source_timestamp)fail("Source, post ID, and source timestamp required");
  const expected=trial[variant+"_post_id"];
  if(expected!==observation.post_id)fail("Observation must match assigned platform post ID");
  const existing=[...(records[variant]||[])];
  if(!existing.some(o=>o.source+"|"+o.post_id+"|"+o.source_timestamp===key))
    existing.push({...observation,saves_per_1000_views:ratePerThousand(observation.saves,observation.views)});
  records[variant]=existing;
  return {...experiment,trial:{...trial,observations:records}};
}
export function evaluateTrial(experiment) {
  const trial=getTrial(experiment),rule=trial.comparison;
  if(experiment?.status!=="trial"||!rule)return {eligible:false,reason:"Experiment trial/comparison not ready"};
  const newest=(trial.observations?.control||[]).at(-1),other=(trial.observations?.test||[]).at(-1);
  if(!newest||!other)return {eligible:false,reason:"Both dated insights are required"};
  const age=o=>(new Date(o.collected_at)-new Date(o.published_at))/3600000;
  const ages=[age(newest),age(other)];
  const tolerance=rule.age_tolerance_hours??4;
  if(ages.some(a=>!finite(a)||Math.abs(a-rule.comparison_age_hours)>tolerance))
    return {eligible:false,reason:"Posts not observed at comparable specified ages",ages};
  if(newest.views<rule.minimum_views||other.views<rule.minimum_views)return {eligible:false,reason:"Both posts must reach minimum views",views:[newest.views,other.views]};
  const score=o=>rule.pass_rule==="test_higher_retention"?o.avg_percent_viewed:ratePerThousand(o.saves,o.views);
  const control=score(newest),test=score(other);
  if(!finite(control)||!finite(test))return {eligible:false,reason:"Comparison metric unavailable"};
  const delta=test-control,minDelta=rule.minimum_improvement??0;
  return {eligible:true,pass:delta>minDelta,metric:rule.pass_rule,control,test,
    difference:delta,suggestion:delta>minDelta?"Consider sharing test after human review":"Keep control or plan a new test",
    caution:"Instagram Trial Reels are not randomized controlled A/B tests."};
}
export function closeTrial(experiment,{decision,shared_url=null,decision_at=null}={}){
  if(experiment?.status!=="trial")fail("Only trial experiments can close");
  const result=evaluateTrial(experiment);
  if(!result.eligible)fail("Trial comparison incomplete: "+result.reason);
  if(!["share_control","share_test","share_neither"].includes(decision))fail("Explicit human sharing decision required");
  if(decision!=="share_neither"&&!hasUrl(shared_url))fail("Actual shared Reel URL required");
  if(!decision_at||Number.isNaN(new Date(decision_at).getTime()))fail("Recorded human decision timestamp required");
  return {...experiment,status:"closed",trial:{...getTrial(experiment),outcome:result,decision,shared_url,decision_at},
    closed_at:decision_at,note:"Closed experiment cannot be reused. New comparison requires a new experiment_id and parent link."};
}
