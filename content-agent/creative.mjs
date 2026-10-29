// Kairo Knox Creative Director: evaluates ideas before expensive generation.
// Scores are an editorial rubric, not a platform ranking prediction.
const criteria=[
  ["hook","By second two, the viewer sees a concrete subject and consequence"],
  ["relevance","A nontechnical person can see the personal stakes"],
  ["payoff","A specific promise has a demonstrable resolution"],
  ["teaching","Viewer gains a safe applicable lesson or mental model"],
  ["personality","Kairo has a distinctive natural observation, optional precise humor"],
  ["visual_evidence","A real or clearly labeled illustrative mechanism is shown"],
  ["distribution","Platform-specific packaging and a measurable hypothesis exist"]
];
const asText=x=>typeof x==="string"&&x.trim().length>0;
export function creativeDirector(pitch){
  if(!pitch||!asText(pitch.id))throw new Error("Unique pitch ID required");
  const required=["audience","human_stakes","topic","hook_consequence","hook_prediction",
    "evidence","observable_result","lesson","visual_plan","platforms","hypothesis"];
  const missing=required.filter(k=>k==="platforms"?!Array.isArray(pitch.platforms)||!pitch.platforms.length:!asText(pitch[k]));
  const hazards=[
    ["fabricated_claims","Unsupported or fabricated factual claims"],
    ["unlicensed_assets","No rights/permission for external media"],
    ["private_data","Private or confidential data exposed"],
    ["unsafe_demonstration","Unsafe demonstration"],
    ["auto_publish","Publishing requested without final human approval"]
  ].filter(([key])=>pitch[key]===true).map(([,value])=>value);
  const scores={},notes=[];
  for(const [key,explanation] of criteria){
    const n=pitch.scores?.[key];
    if(!Number.isInteger(n)||n<0||n>2)notes.push("Missing 0–2 editorial score for "+key+": "+explanation);
    else scores[key]=n;
  }
  const total=Object.values(scores).reduce((sum,v)=>sum+v,0);
  const eligible=missing.length===0&&hazards.length===0&&notes.length===0&&total>=11;
  const firstFrame={image:pitch.visual_plan??null,line:pitch.hook_consequence??null};
  return {pitch_id:pitch.id,total,max:14,eligible_for_production_review:eligible,
    disposition:hazards.length?"BLOCK":missing.length||notes.length?"INCOMPLETE":eligible?"REVIEW READY":"REWRITE",
    score_breakdown:scores,missing_fields:missing,hard_stops:hazards,scoring_notes:notes,
    tested_hooks:[
      {type:"consequence-first",opening:pitch.hook_consequence??null},
      {type:"prediction-first",opening:pitch.hook_prediction??null}
    ],
    story:{
      "0–2s":firstFrame,
      "2–6s":pitch.human_stakes??null,
      "6–18s":pitch.evidence??null,
      "18–27s":pitch.observable_result??null,
      "27–35s":pitch.lesson??null
    },
    humor_rule:"Use a short relevant joke only if true to Kairo's voice and it does not slow the explanation.",
    verified_provenance:pitch.sources??[],
    cautions:["No score guarantees retention.","No external footage without appropriate rights.","A storyboard is not a finished, verified video.","Final publication still requires explicit human approval."]
  };
}
export const CREATIVE_CRITERIA=criteria.map(([id,description])=>({id,description,max:2}));
