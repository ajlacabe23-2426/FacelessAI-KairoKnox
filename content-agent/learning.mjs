import {ratePerThousand,featureContrast} from "./analysis.mjs";
const num=x=>typeof x==="number"&&Number.isFinite(x);
const weekOf=x=>{const d=new Date(x);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()+3-(d.getUTCDay()+6)%7);const y=d.getUTCFullYear();const j=new Date(Date.UTC(y,0,4));return y+"-W"+String(1+Math.round((d-(j.getTime()-((j.getUTCDay()+6)%7)*86400000))/604800000)).padStart(2,"0");};
const ageDays=(date,now)=>(new Date(now)-new Date(date))/86400000;
function metricValue(o,metric){
  if(metric==="saves_per_1000_views")return ratePerThousand(o.saves,o.views);
  if(metric==="retention_at_10") {
    const value=(o.retention||[]).find(p=>p.second===10)?.retained;
    return num(value)?value:null;
  }
  if(metric==="follows_per_1000_views")return num(o.follows)&&num(o.views)&&o.views>0?1000*o.follows/o.views:null;
  if(metric==="avg_percent_viewed")return num(o.avg_percent_viewed)?o.avg_percent_viewed:null;
  return null;
}
export function eligibleLearningManifest(posts,{now=new Date().toISOString(),days=60}={}){
  const candidates=[],unavailable=[],used=new Set();
  for(const post of posts||[]){
    const id=post.variant_id??post.post_id;
    if(!id){unavailable.push({id:null,reason:"missing variant/post ID"});continue;}
    const o=[...(post.observations||[])].filter(v=>v?.collected_at&&v?.published_at)
      .sort((a,b)=>new Date(b.collected_at)-new Date(a.collected_at))[0];
    const age=o?ageDays(o.published_at,now):NaN;
    const experimentGroup=post.experiment_id??"single:"+id;
    if(!o||!num(age)||age<0||age>days){unavailable.push({id,reason:"observation unavailable or outside window"});continue;}
    if(used.has(experimentGroup)){unavailable.push({id,reason:"sibling experiment already represented"});continue;}
    used.add(experimentGroup);
    candidates.push({id,experiment_id:experimentGroup,platform:o.platform??null,distribution_period:o.distribution_period??post.distribution_period??null,
      published_at:o.published_at,collected_at:o.collected_at,views:o.views??null,
      labels:post.feature_labels||{},feature_labeled_at:post.feature_labeled_at??null,
      observation:o});
  }
  return {eligible:candidates,unavailable,eligible_count:candidates.length,processed_count:candidates.length,
    note:"One representative post per experiment; group exclusion is not proof that all variants agree."};
}
export function executeInstrument(instrument,manifest){
  if(!instrument||typeof instrument.feature!=="string"||!["retention_at_10","avg_percent_viewed","saves_per_1000_views","follows_per_1000_views"].includes(instrument.metric))return {status:"invalid instrument"};
  if(!instrument.platform || !instrument.distribution_period)return {status:"invalid instrument",reason:"platform and distribution period required"};
  const rows=[],unknown=[];
  for(const item of manifest.eligible){
    if(item.platform!==instrument.platform||item.distribution_period!==instrument.distribution_period)continue;
    const label=item.labels[instrument.feature], value=metricValue(item.observation,instrument.metric);
    const labeledTime=new Date(item.feature_labeled_at).getTime(),metricTime=new Date(item.collected_at).getTime();
    if(typeof label!=="boolean"||!num(value)||!Number.isFinite(labeledTime)||labeledTime>=metricTime) {
      unknown.push({id:item.id,reason:"missing pre-metric feature label or observation"});continue;
    }
    rows.push({id:item.id,features:{[instrument.feature]:label},observation:{...item.observation,
      [instrument.metric]:value,views:item.views}});
  }
  const compared=featureContrast(rows,instrument.feature,{metric:instrument.metric,
    minPerSide:Math.max(8,instrument.min_per_side??8),
    maxReachRatio:instrument.max_reach_ratio??2,
    maxAgeDifferenceHours:instrument.max_age_difference_hours??96});
  if(compared.status!=="descriptive only")return {...compared,missing:unknown,eligible_ids:rows.map(r=>r.id)};
  const direction=instrument.expected_direction??"higher";
  const supported=direction==="higher"?compared.difference>0:compared.difference<0;
  return {...compared,missing:unknown,eligible_ids:rows.map(r=>r.id),supports_direction:supported,
    caution:"Feature labels are associations, not controlled causes. A stronger topic can confound editing."};
}
export function learningSession({lessons=[],posts=[],now=new Date().toISOString(),week=null}){
  const reportWeek=week??weekOf(now),manifest=eligibleLearningManifest(posts,{now});
  const updates=[],results=[];
  for(const lesson of lessons){
    if(!lesson.lesson_id||!lesson.claim||!lesson.instrument)throw new Error("Lesson needs ID, retained claim and executable instrument");
    const original={...lesson,confirmations:[...(lesson.confirmations||[])],history:[...(lesson.history||[])]};
    const result=executeInstrument(original.instrument,manifest);
    const priorTest=original.last_tested_at??original.created_at??null;
    const days=priorTest?ageDays(priorTest,now):null;
    let status=original.status??"hunch";
    if(days!==null&&days>=90)status="stale";
    else if(days!==null&&days>=30&&status==="settled")status="likely";
    else if(days!==null&&days>=30&&status==="likely")status="hunch";
    const sameWeek=original.history.some(h=>h.week===reportWeek);
    const priorEvidence=new Set(original.confirmations.flatMap(c=>c.eligible_ids??[]));
    const newIds=(result.eligible_ids??[]).filter(id=>!priorEvidence.has(id));
    // Count only an independently later weekly run with some new supporting post IDs.
    let action="no promotion";
    if(!sameWeek && result.status==="descriptive only"){
      if(result.supports_direction && newIds.length>0){
        original.confirmations.push({week:reportWeek,at:now,eligible_ids:newIds,metric:original.instrument.metric});
        action="confirmed with new observations";
      } else if(!result.supports_direction) {
        status="weakened"; action="counterevidence observed";
      } else action="no independent new observations";
    }
    if(!["weakened","stale"].includes(status))status=original.confirmations.length>=3?"settled":original.confirmations.length>=2?"likely":"hunch";
    if(!sameWeek) original.history.push({week:reportWeek,at:now,status,action,analysis:result});
    original.status=status;original.last_tested_at=now;
    updates.push(original);
    results.push({lesson_id:original.lesson_id,claim:original.claim,status,action,analysis:result});
  }
  // Recommend properties and measures; never generate actual scripts or automatically create experiment IDs.
  const briefIdeas=[
    {property:"Consequence-first visible opening",fixed:"Topic, voice, duration band, and core evidence",metric:"retention_at_10"},
    {property:"Prediction before a genuine demonstrated result",fixed:"Subject, evidence, and closing lesson",metric:"retention_at_10"},
    {property:"Useful one-sentence takeaway after reveal",fixed:"Opening, demonstration and cut length",metric:"follows_per_1000_views"}
  ];
  return {week:reportWeek,generated_at:now,manifest,lesson_count:updates.length,coverage:{processed:manifest.processed_count,total:manifest.eligible_count},
    lesson_updates:updates,results,three_next_test_briefs:briefIdeas.map(x=>({...x,evidence:"Unverified pilot hypothesis; not derived from insufficient archive"})),
    warnings:["Independent confirmation requires later weeks and new post IDs.","Do not infer individual-video causes from group associations.","No scripts, posts, or experiments created."]};
}
