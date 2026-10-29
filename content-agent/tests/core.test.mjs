import test from "node:test";
import assert from "node:assert/strict";
import {percentileContinuous,ratePerThousand,validateSegments,threeSecondWindows,postMortem,featureContrast} from "../analysis.mjs";
import {creativeDirector} from "../creative.mjs";
import {eligibleLearningManifest,executeInstrument,learningSession} from "../learning.mjs";
import {prepareTrial,registerTrialPosts,recordTrialObservation,evaluateTrial,closeTrial} from "../trials.mjs";
const date="2026-10-29T12:00:00Z";
const obs=(post,views=1200,extra={})=>({source:"test",source_timestamp:"2026-10-27T12:00:00Z",collected_at:"2026-10-27T12:00:00Z",
 published_at:"2026-10-26T12:00:00Z",platform:"instagram",post_id:post,distribution_period:"2026-10",
 views,saves:12,shares:3,avg_percent_viewed:.4,retention:[{second:0,retained:1},{second:3,retained:.7},{second:10,retained:.35}],...extra});
const v=(id,extra={})=>({variant_id:id,platform_post_id:id,post_url:"https://www.instagram.com/reel/"+id+"/",
 duration_seconds:3.25,media_verified:true,source_map_verified:true,
 speech_segments:[{start:0,end:3.25}],screen_segments:[{start:0,end:3.25}],
 observations:[obs(id)],...extra});
test("paired saves/views, null unknown and linear interpolated percentile",()=>{
 assert.equal(ratePerThousand(10,1000),10);
 assert.equal(ratePerThousand(null,1000),null);
 assert.equal(ratePerThousand(10,null),null);
 assert.equal(percentileContinuous([10,20,30,40,50],.8),42);
});
test("fractional final-second coverage is mandatory",()=>{
 assert.equal(validateSegments(3.25,[{start:0,end:3}]).complete,false);
 assert.deepEqual(validateSegments(3.25,[{start:0,end:3}]).gaps,[{start:3,end:3.25}]);
 assert.equal(validateSegments(3.25,[{start:0,end:3.25}]).complete,true);
});
test("retention gaps remain unknown and no artificial interpolation",()=>{
 const w=threeSecondWindows([{second:0,retained:1},{second:3,retained:.7}],4);
 assert.equal(w.valid.length,1); assert.equal(w.valid[0].relative_loss,.3);
 assert.equal(w.missing.length,1);assert.equal(w.missing[0].start,1);
});
test("postmortem never advances incomplete media",()=>{
 const e={experiment_id:"E1",status:"testing",platform:"instagram",distribution_period:"2026-10",
   comparison_age_hours:24,variants:[v("A"),v("B",{screen_segments:[{start:0,end:3}]})]};
 const result=postMortem({experiment:e,now:date});
 assert.equal(result.suggested_status,"testing");
 assert.ok(result.coverage_gaps.some(x=>x.variant==="B"&&x.issue.includes("screen")));
 assert.equal(result.archive.status,"insufficient archive");
 assert.equal(result.archive.threshold_p80_saves_per_1000,null);
});
test("archive threshold requires twenty independent eligible experiments",()=>{
 const experiment={experiment_id:"E1",status:"testing",platform:"instagram",distribution_period:"2026-10",variants:[v("A"),v("B")]};
 const archive=Array.from({length:19},(_,i)=>({experiment_id:"ext-"+i,variant_id:"X"+i,observations:[obs("X"+i)]}));
 assert.equal(postMortem({experiment,archive,now:date}).archive.status,"insufficient archive");
 archive.push({experiment_id:"ext-19",variant_id:"X19",observations:[obs("X19")]});
 const result=postMortem({experiment,archive,now:date});
 assert.equal(result.archive.status,"threshold calculated");
 assert.equal(result.archive.threshold_p80_saves_per_1000,10);
});
test("feature explanations require eight in each group and comparable reach",()=>{
 const rows=Array.from({length:15},(_,i)=>({id:"p"+i,features:{proof:i<8},observation:obs("p"+i)}));
 assert.equal(featureContrast(rows,"proof").status,"insufficient examples");
 rows.push({id:"p15",features:{proof:false},observation:obs("p15")});
 assert.equal(featureContrast(rows,"proof").status,"descriptive only");
});
const pitch={id:"P1",audience:"casual social users",human_stakes:"how feeds adapt",topic:"recommenders",
 hook_consequence:"One pause changed this sample feed",hook_prediction:"Can one pause matter?",
 evidence:"original simplified demonstration",observable_result:"illustrated score ranking changes",
 lesson:"one signal is not your personality",visual_plan:"transparent mock feed",platforms:["instagram"],
 hypothesis:"higher 10-second retention",
 scores:{hook:2,relevance:2,payoff:2,teaching:2,personality:1,visual_evidence:2,distribution:2}};
test("creative direction requires truthful inputs and two hooks",()=>{
 assert.equal(creativeDirector(pitch).eligible_for_production_review,true);
 assert.equal(creativeDirector({...pitch,unlicensed_assets:true}).disposition,"BLOCK");
 assert.equal(creativeDirector({...pitch,hook_prediction:""}).disposition,"INCOMPLETE");
});
test("learning manifest groups siblings; no fake later confirmation",()=>{
 const posts=[
 {experiment_id:"E1",variant_id:"a",feature_labels:{proof:true},feature_labeled_at:"2026-10-26T00:00:00Z",observations:[obs("a")]},
 {experiment_id:"E1",variant_id:"b",feature_labels:{proof:false},feature_labeled_at:"2026-10-26T00:00:00Z",observations:[obs("b")]}
 ];
 const m=eligibleLearningManifest(posts,{now:date});
 assert.equal(m.eligible_count,1);assert.equal(m.unavailable[0].reason,"sibling experiment already represented");
 const first=learningSession({posts,now:date,lessons:[{lesson_id:"L1",claim:"Visible proof helps",
   instrument:{feature:"proof",metric:"retention_at_10",platform:"instagram",distribution_period:"2026-10"}}]});
 assert.equal(first.results[0].analysis.status,"insufficient examples");
 assert.equal(first.lesson_updates[0].status,"hunch");
 const rerun=learningSession({posts,now:"2026-10-29T15:00:00Z",week:first.week,lessons:first.lesson_updates});
 assert.equal(rerun.lesson_updates[0].confirmations.length,0);
});
test("trial control requires review, two verified compositions and specified comparison",()=>{
 assert.throws(()=>prepareTrial({experiment_id:"E1",status:"testing",variants:[v("A"),v("B")]}));
 const result=prepareTrial({experiment_id:"E1",status:"reviewed",variants:[v("A"),v("B")]});
 assert.equal(result.ready_for_private_trial,false);
 assert.equal(result.blockers.length,3);
 const unprepared=registerTrialPosts({experiment_id:"E2",status:"reviewed",trial:{comparison:{comparison_age_hours:24,minimum_views:1000,pass_rule:"test_higher_retention"}}},
  {control_url:"https://www.instagram.com/reel/first/",control_post_id:"first",test_url:"https://www.instagram.com/reel/second/",test_post_id:"second"});
 assert.equal(unprepared.status,"reviewed");
});
test("trial URLs, dated paired insights, comparison and explicit human closure",()=>{
 const e={experiment_id:"E1",status:"reviewed",trial:{compositions:{control:{verified:true},test:{verified:true}},comparison:{comparison_age_hours:24,
  age_tolerance_hours:1,minimum_views:1000,pass_rule:"test_higher_retention",minimum_improvement:0}}};
 const partial=registerTrialPosts(e,{control_url:"https://www.instagram.com/reel/one/",control_post_id:"one"});
 assert.equal(partial.status,"reviewed");
 let trial=registerTrialPosts(partial,{test_url:"https://www.instagram.com/reel/two/",test_post_id:"two"});
 assert.equal(trial.status,"trial");
 trial=recordTrialObservation(trial,{variant:"control",observation:obs("one",1200,{avg_percent_viewed:.35})});
 trial=recordTrialObservation(trial,{variant:"test",observation:obs("two",1300,{avg_percent_viewed:.41})});
 const same=recordTrialObservation(trial,{variant:"test",observation:obs("two",1300,{avg_percent_viewed:.41})});
 assert.equal(same.trial.observations.test.length,1);
 assert.equal(evaluateTrial(same).pass,true);
 assert.throws(()=>closeTrial(same,{decision:"share_test",decision_at:date}));
 assert.equal(closeTrial(same,{decision:"share_neither",decision_at:date}).status,"closed");
});
