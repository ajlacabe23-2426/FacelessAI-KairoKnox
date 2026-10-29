// Kairo Knox content intelligence core. Node 20+; no external dependencies.
// The inputs are explicit, time-stamped, attributed observations. Missing data is never interpolated.
const isNum = x => typeof x === "number" && Number.isFinite(x);
const sorted = values => [...values].sort((a,b)=>a-b);
const approx = (a,b) => Math.abs(a-b)<1e-7;
const err = message => { throw new Error(message); };
const hoursOld = (date,at) => (new Date(at).getTime()-new Date(date).getTime())/3600000;
const isoWeek = iso => {
  const d=new Date(iso);
  if(Number.isNaN(d.getTime())) return "invalid";
  const day=(d.getUTCDay()+6)%7;
  const thu=new Date(d.getTime()-day*86400000+3*86400000);
  const first=new Date(Date.UTC(thu.getUTCFullYear(),0,4));
  const delta=(first.getUTCDay()+6)%7;
  return thu.getUTCFullYear()+"-W"+String(1+Math.round((thu-(first.getTime()-delta*86400000))/604800000)).padStart(2,"0");
};
export function percentileContinuous(values,p=.8) {
  const nums=sorted(values.filter(isNum));
  if(!nums.length || !isNum(p)||p<0||p>1) return null;
  const at=(nums.length-1)*p,lo=Math.floor(at),hi=Math.ceil(at);
  return nums[lo]+(nums[hi]-nums[lo])*(at-lo);
}
export function ratePerThousand(saves,views) {
  return isNum(saves)&&isNum(views)&&saves>=0&&views>0 ? 1000*saves/views : null;
}
export function validateSegments(duration,segments) {
  if(!isNum(duration)||duration<=0) err("Valid positive media duration required");
  const items=(segments||[]).map(s=>({start:s.start,end:s.end})).sort((a,b)=>a.start-b.start);
  if(items.some(s=>!isNum(s.start)||!isNum(s.end)||s.start<0||s.end<=s.start||s.end>duration+1e-7)) {
    return {complete:false,gaps:[{start:0,end:duration}],reason:"Invalid timestamp segment"};
  }
  let cursor=0;const gaps=[];
  for(const item of items){if(item.start>cursor+1e-7) gaps.push({start:cursor,end:item.start});cursor=Math.max(cursor,item.end);}
  if(cursor<duration-1e-7)gaps.push({start:cursor,end:duration});
  return {complete:gaps.length===0,gaps,covered_seconds:duration-gaps.reduce((s,g)=>s+g.end-g.start,0)};
}
// Explicit, verified source-to-cut temporal map. This validates structure, not footage identity.
export function validateSourceMap(duration,sourceDuration,map) {
  if(!isNum(sourceDuration)||sourceDuration<=0||!Array.isArray(map)||!map.length)
    return {complete:false,reason:"Explicit original source duration and cut mapping required",gaps:[{start:0,end:duration}]};
  const items=[...map].sort((a,b)=>a.cut_start-b.cut_start);
  for(let i=0;i<items.length;i++){
    const s=items[i];
    if(![s.cut_start,s.cut_end,s.source_start,s.source_end].every(isNum) ||
       s.cut_start<0||s.cut_end<=s.cut_start||s.cut_end>duration+1e-7||
       s.source_start<0||s.source_end<=s.source_start||s.source_end>sourceDuration+1e-7||
       !approx(s.cut_end-s.cut_start,s.source_end-s.source_start) ||
       (i>0&&s.cut_start<items[i-1].cut_end-1e-7))
       return {complete:false,reason:"Invalid or overlapping original-to-cut time map",gaps:[]};
  }
  const coverage=validateSegments(duration,items.map(s=>({start:s.cut_start,end:s.cut_end})));
  return {...coverage,source_duration_seconds:sourceDuration};
}
export function threeSecondWindows(retention,duration) {
  if(!isNum(duration)||duration<3)return {valid:[],missing:[],note:"Clip shorter than three seconds"};
  const map=new Map((retention||[]).filter(p=>isNum(p.second)&&isNum(p.retained)&&p.retained>=0&&p.retained<=1).map(p=>[Number(p.second.toFixed(6)),p.retained]));
  const starts=new Set();
  for(let t=0;t<=Math.floor(duration-3);t++)starts.add(t);
  for(const time of map.keys())if(time>=0&&time+3<=duration+1e-7)starts.add(time);
  const valid=[],missing=[];
  for(const t of sorted([...starts])){
    const left=map.get(Number(t.toFixed(6))),right=map.get(Number((t+3).toFixed(6)));
    if(left===undefined || right===undefined || left===0)missing.push({start:t,end:t+3,reason:left===0?"zero initial retention":"point not observed"});
    else valid.push({start:t,end:t+3,relative_loss:1-right/left,retained_start:left,retained_end:right});
  }
  return {valid,missing};
}
function selectObservation(observations,comparisonAge) {
  const items=(observations||[]).filter(x=>x&&x.collected_at&&x.published_at);
  if(!items.length)return null;
  const ordered=[...items].sort((a,b)=>new Date(a.collected_at)-new Date(b.collected_at));
  if(comparisonAge===null||comparisonAge===undefined)return ordered.at(-1);
  return ordered.reduce((best,o)=>{
    const age=hoursOld(o.published_at,o.collected_at), delta=Math.abs(age-comparisonAge);
    const bestDelta=best?Math.abs(hoursOld(best.published_at,best.collected_at)-comparisonAge):Infinity;
    return delta<bestDelta?o:best;
  },null);
}
export function describeObservation(o) {
  if(!o)return {available:false};
  const age=hoursOld(o.published_at,o.collected_at);
  return {available:true,platform:o.platform??null,post_id:o.post_id??null,
    collected_at:o.collected_at,post_age_hours:Number.isFinite(age)?age:null,
    views:isNum(o.views)?o.views:null,saves:isNum(o.saves)?o.saves:null,
    shares:isNum(o.shares)?o.shares:null,avg_watch_seconds:isNum(o.avg_watch_seconds)?o.avg_watch_seconds:null,
    avg_percent_viewed:isNum(o.avg_percent_viewed)?o.avg_percent_viewed:null,
    saves_per_1000_views:ratePerThousand(o.saves,o.views)};
}
export function eligibleArchive(archive,experiment,{now=new Date().toISOString(),minViews=1000,days=60}={}) {
  // Use just one post per experiment_id so sibling cuts cannot inflate independent evidence.
  const byExp=new Map(),excluded=[];
  for(const v of archive||[]){
    const o=selectObservation(v.observations||[],experiment.comparison_age_hours??null);
    const reason=!o?"no observation":!o.platform||o.platform!==experiment.platform?"different platform":
      (o.distribution_period??v.distribution_period??null)!==(experiment.distribution_period??null)?"different distribution period":
      v.experiment_id===experiment.experiment_id?"same experiment":
      !isNum(o.views)||o.views<minViews?"below minimum views":
      isNum(experiment.comparison_age_hours)&&Math.abs(hoursOld(o.published_at,o.collected_at)-experiment.comparison_age_hours)>(experiment.age_tolerance_hours??4)?"outside comparison age":
      !isNum(hoursOld(o.published_at,now))||hoursOld(o.published_at,now)<0||hoursOld(o.published_at,now)>days*24?"outside time range":null;
    if(reason){excluded.push({id:v.variant_id??v.post_id??null,reason});continue;}
    const key=v.experiment_id??"standalone:"+o.post_id;
    const prior=byExp.get(key);
    if(!prior||new Date(o.collected_at)>new Date(prior.observation.collected_at))byExp.set(key,{id:v.variant_id??o.post_id,experiment_id:key,observation:o,duration_seconds:v.duration_seconds??null,features:v.features||{}});
  }
  return {eligible:[...byExp.values()],excluded};
}
export function postMortem({experiment,archive=[],now=new Date().toISOString()}) {
  if(!experiment||!experiment.experiment_id)err("experiment_id is required");
  if(experiment.status!=="testing"&&experiment.status!=="reviewed")err("Post-mortems require testing/reviewed experiment");
  if(!Array.isArray(experiment.variants)||experiment.variants.length!==2)err("Exactly two assigned variants required");
  const problems=[],variants=[];
  if(!isNum(experiment.comparison_age_hours)||experiment.comparison_age_hours<=0)
    problems.push({issue:"predeclared comparison age is missing"});
  for(const v of experiment.variants){
    if(!v.variant_id||!v.platform_post_id||!v.post_url)problems.push({variant:v.variant_id??null,issue:"missing assigned ID or published URL"});
    if(v.media_verified!==true||v.source_map_verified!==true)problems.push({variant:v.variant_id,issue:"media or original-to-cut map unverified"});
    const sourceMap=validateSourceMap(v.duration_seconds,v.source_duration_seconds,v.source_time_map);
    if(!v.source_file_id||!sourceMap.complete)problems.push({variant:v.variant_id,issue:"explicit original-to-cut time map incomplete",gaps:sourceMap.gaps,reason:sourceMap.reason??null});
    const speech=validateSegments(v.duration_seconds,v.speech_segments);
    const screen=validateSegments(v.duration_seconds,v.screen_segments);
    if(!speech.complete)problems.push({variant:v.variant_id,issue:"speech coverage incomplete",gaps:speech.gaps});
    if(!screen.complete)problems.push({variant:v.variant_id,issue:"screen coverage incomplete",gaps:screen.gaps});
    const o=selectObservation(v.observations||[],experiment.comparison_age_hours??null);
    if(!o)problems.push({variant:v.variant_id,issue:"metrics unavailable"});
    else if(isNum(experiment.comparison_age_hours)&&Math.abs(hoursOld(o.published_at,o.collected_at)-experiment.comparison_age_hours)>(experiment.age_tolerance_hours??4))
      problems.push({variant:v.variant_id,issue:"observation is not at the predeclared comparison age"});
    const windows=threeSecondWindows(o?.retention??[],v.duration_seconds);
    variants.push({variant_id:v.variant_id,platform_post_id:v.platform_post_id??null,
      source_map_coverage:sourceMap,speech_coverage:speech,screen_coverage:screen,
      metrics:describeObservation(o),retention_windows:windows,
      edit_notes:(v.edit_notes||[]).map(n=>{
        if(!["KEEP","CHANGE","CUT"].includes(n.action)||!isNum(n.start)||!isNum(n.end)||n.start<0||n.end>v.duration_seconds||n.end<=n.start)err("Edit notes require exact timestamps and KEEP / CHANGE / CUT");
        if(n.action!=="KEEP"&&!["EDIT-ONLY","RE-RECORD"].includes(n.method))err("Changes require EDIT-ONLY or RE-RECORD");
        if(!n.words||typeof n.words!=="string")err("Editor must provide exact source words");
        return {...n,hypothesis:true};
      })});
  }
  const lib=eligibleArchive(archive,experiment,{now});
  const archiveRates=lib.eligible.map(e=>ratePerThousand(e.observation.saves,e.observation.views)).filter(isNum);
  const enough=lib.eligible.length>=20&&archiveRates.length>=20;
  const threshold=enough?percentileContinuous(archiveRates,.8):null;
  const winners=enough?lib.eligible.filter(e=>ratePerThousand(e.observation.saves,e.observation.views)>=threshold):[];
  const winnerWindows=new Map();
  for(const winner of winners){
    if(!isNum(winner.duration_seconds))continue;
    for(const window of threeSecondWindows(winner.observation.retention,winner.duration_seconds).valid){
      const key=window.start.toFixed(6);
      if(!winnerWindows.has(key))winnerWindows.set(key,[]);
      winnerWindows.get(key).push(window.relative_loss);
    }
  }
  const winnerWindowReference=[...winnerWindows.entries()].map(([key,losses])=>({
    start:Number(key),end:Number(key)+3,eligible_winner_count:losses.length,
    median_relative_loss:percentileContinuous(losses,.5)}));
  for(const variant of variants){
    variant.winner_window_comparisons=variant.retention_windows.valid.map(w=>{
      const matched=winnerWindowReference.find(x=>approx(x.start,w.start));
      return {start:w.start,end:w.end,own_relative_loss:w.relative_loss,
        winner_median_relative_loss:matched?.median_relative_loss??null,
        difference:matched? w.relative_loss-matched.median_relative_loss:null,
        winner_coverage_count:matched?.eligible_winner_count??0};
    });
  }
  return {experiment_id:experiment.experiment_id,generated_at:now,objective:experiment.objective??null,
    decision_rule:experiment.decision_rule??null,comparison_age_hours:experiment.comparison_age_hours??null,
    variants,archive:{eligible_count:lib.eligible.length,paired_rate_count:archiveRates.length,
      threshold_p80_saves_per_1000:threshold,eligible_winner_count:winners.length,
      winner_window_reference:winnerWindowReference,
      status:enough?"threshold calculated":"insufficient archive",excluded:lib.excluded},
    suggested_status:problems.length?"testing":"reviewed",coverage_gaps:problems,
    cautions:["A retention dip identifies when viewers left, not why.","Unknown retention seconds remain unknown.","Different distribution periods or post ages can confound comparisons."]};
}
export function featureContrast(rows,feature,{metric="avg_percent_viewed",minPerSide=8,maxReachRatio=2,maxAgeDifferenceHours=96}={}) {
  const yes=[],no=[];
  for(const row of rows||[]){
    if(typeof row.features?.[feature]!=="boolean" || !row.observation)continue;
    const o=row.observation, val=metric==="saves_per_1000_views"?ratePerThousand(o.saves,o.views):o[metric];
    const age=hoursOld(o.published_at,o.collected_at);
    if(!isNum(val)||!isNum(age)||!isNum(o.views)||o.views<=0)continue;
    (row.features[feature]?yes:no).push({id:row.id,val,age,reach:o.views});
  }
  const mean=(items,key)=>items.reduce((s,x)=>s+x[key],0)/items.length;
  if(yes.length<minPerSide||no.length<minPerSide)return {status:"insufficient examples",yes:yes.length,no:no.length};
  const reachRatio=Math.max(mean(yes,"reach"),mean(no,"reach"))/Math.min(mean(yes,"reach"),mean(no,"reach"));
  if(reachRatio>maxReachRatio||Math.abs(mean(yes,"age")-mean(no,"age"))>maxAgeDifferenceHours)return {status:"not comparable",yes:yes.length,no:no.length,reach_ratio:reachRatio};
  const left=mean(yes,"val"),right=mean(no,"val");
  const counterexamples=yes.filter(x=>x.val<right).slice(0,5).map(x=>x.id);
  return {status:"descriptive only",yes:yes.length,no:no.length,feature,metric,mean_yes:left,mean_no:right,
    difference:left-right,counterexamples,warning:"Association is not causality; inspect topic, recency and sibling-cut noise."};
}
