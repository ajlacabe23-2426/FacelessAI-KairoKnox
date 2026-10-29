#!/usr/bin/env node
// Offline-only CLI for selected Kairo Content Agent capabilities (#3, #4, #5, Creative Director).
// No browser, credentials, API calls, analytics collection, or automated publication.
import {readFile,mkdir,writeFile,rename} from "node:fs/promises";
import {dirname,resolve,relative,isAbsolute} from "node:path";
import {creativeDirector} from "./creative.mjs";
import {postMortem} from "./analysis.mjs";
import {learningSession} from "./learning.mjs";
import {prepareTrial,registerTrialPosts,recordTrialObservation,evaluateTrial,closeTrial} from "./trials.mjs";
const usage="Usage: node content-agent/cli.mjs <creative|postmortem|learn|trial-prepare|trial-posts|trial-observation|trial-evaluate|trial-close> <private-input.json> [--out .content-agent/report.json]";
const [command,inputPath,...flags]=process.argv.slice(2);
if(!command||!inputPath){console.error(usage);process.exitCode=2;}
else{
  try{
    const parsed=JSON.parse(await readFile(resolve(inputPath),"utf8"));
    const value=(()=>{
      switch(command){
        case "creative":return creativeDirector(parsed.pitch??parsed);
        case "postmortem":return postMortem(parsed);
        case "learn":return learningSession(parsed);
        case "trial-prepare":return prepareTrial(parsed.experiment,parsed.options??{});
        case "trial-posts":return registerTrialPosts(parsed.experiment,parsed.posts??{});
        case "trial-observation":return recordTrialObservation(parsed.experiment,{variant:parsed.variant,observation:parsed.observation});
        case "trial-evaluate":return evaluateTrial(parsed.experiment);
        case "trial-close":return closeTrial(parsed.experiment,parsed.decision??{});
        default:throw new Error("Unknown command. "+usage);
      }
    })();
    // No passwords, tokens, cookies, local browser profiles, or authenticated sessions in reports.
    const forbidden=new Set(["password","api_key","access_token","refresh_token","cookie","cookies",
      "session","browser_profile","browser_session","credential","credentials","authorization"]);
    const scrub=(x)=>{
      if(Array.isArray(x))return x.map(scrub);
      if(x&&typeof x==="object")return Object.fromEntries(Object.entries(x)
        .filter(([k])=>!forbidden.has(k.toLowerCase())).map(([k,v])=>[k,scrub(v)]));
      return x;
    };
    const result=JSON.stringify(scrub(value),null,2)+"\n";
    const outIndex=flags.indexOf("--out");
    if(outIndex!==-1){
      if(!flags[outIndex+1])throw new Error("Missing --out file");
      const file=resolve(flags[outIndex+1]);
      // Production reports stay under the git-ignored private directory.
      const privateDir=resolve(".content-agent");
      const rel=relative(privateDir,file);
      const outside=rel===".."||rel.startsWith(".."+(process.platform==="win32"?"\\":"/"))||isAbsolute(rel);
      if(!rel||outside)throw new Error("Output must stay inside .content-agent/");
      await mkdir(dirname(file),{recursive:true,mode:0o700});
      const tmp=file+".tmp-"+process.pid;
      await writeFile(tmp,result,{mode:0o600});
      await rename(tmp,file);
      console.log("Private report saved to "+file);
    }else process.stdout.write(result);
  }catch(e){console.error("Content Agent failed: "+e.message);process.exitCode=1;}
}
