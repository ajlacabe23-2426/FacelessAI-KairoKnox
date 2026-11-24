export type VisualMode = 'market'|'timeline'|'network'|'policy'|'compare'|'code'|'audit'|'prompt'|'checklist';
export type InfoRow = Readonly<{label: string; value: string}>;
export type FluidBeat = Readonly<{
  id: string; duration: number; eyebrow: string; headline: string; caption: string;
  mode: VisualMode; rows: readonly InfoRow[]; footnote?: string;
}>;
export type FluidEpisode = Readonly<{
  id: 'NvidiaEconomyFluid60'|'AgentProgrammingFluid60'|'PromptEngineeringFluid60';
  title: string; accent: string; secondary: string; secondaryAccent: string;
  series: string; overlap: 30; fps: 60; width: 1080; height: 1920;
  scenes: readonly FluidBeat[];
}>;

const scene = (id: string, eyebrow: string, headline: string, caption: string, mode: VisualMode, rows: readonly InfoRow[], footnote?: string): FluidBeat =>
  ({id, eyebrow, headline, caption, mode, rows, footnote, duration: 480});

export const fluidEpisodes: readonly FluidEpisode[] = [
  {
    id:'NvidiaEconomyFluid60', title:'Nvidia, power and the wider economy', series:'SIGNAL KUT 008 / INVESTIGATIVE',
    accent:'#A7E88D', secondary:'#F0C97B', secondaryAccent:'#8ADBF7',
    overlap:30, fps:60, width:1080, height:1920,
    scenes:[
      scene('shock','NOV 23, 2026 / MARKET REACTION','THE RALLY\nWAS REAL.','A major leadership reversal coincided with an extraordinary AI-stock rally. The economic meaning takes a closer look.','market',[
        {label:'NVIDIA',value:'+31.5%'},{label:'NASDAQ',value:'+6.5%'},{label:'S&P 500',value:'+4.7%'}
      ],'REPORTED CLOSE MOVES / REUTERS + AP / 23 NOV 2026'),
      scene('return','BOARD ACTION / CONFIRMED','A CEO\nRETURNS.','Nvidia says its board voted on November 22. The return of founder Jensen Huang was announced publicly November 23.','timeline',[
        {label:'NOV 12',value:'CEO TRANSITION'},{label:'NOV 22',value:'BOARD VOTE'},{label:'NOV 23',value:'PUBLIC RELEASE'}
      ],'NVIDIA 8-K / NOVEMBER 23, 2026'),
      scene('capital','MARKET CAPITALIZATION','NEARLY $1T\nREGAINED.','A huge repricing of one company can pull index results upward. It does not measure every household or business.','market',[
        {label:'EQUITY VALUE',value:'NEAR $1T'},{label:'SCOPE',value:'COMPANY VALUE'},{label:'NOT',value:'NEW CASH GDP'}
      ],'MARKET CAPITALIZATION IS NOT DIRECT ECONOMIC OUTPUT'),
      scene('stack','THE REAL ECONOMY','FOLLOW\nTHE MONEY.','AI investment reaches chipmakers, electricity suppliers, data-center builders and the businesses paying for compute.','network',[
        {label:'CHIPS',value:'COMPUTE'},{label:'POWER',value:'GRID'},{label:'BUYERS',value:'CAPEX'}
      ],'ILLUSTRATIVE VALUE CHAIN / NOT REPORTED CASH FLOWS'),
      scene('macro','STOCKS ≠ THE ECONOMY','THE BIGGER\nCONSTRAINTS.','An AI-share rally does not eliminate high borrowing costs or price pressures. Those are separate economic forces.','policy',[
        {label:'FED TARGET',value:'3.75–4.00%'},{label:'OCT CPI M/M',value:'+0.4%'},{label:'CONCLUSION',value:'MIXED SIGNALS'}
      ],'US OCTOBER 2026 MACRO CONTEXT / REVIEW SOURCES'),
      scene('influence','EVIDENCE / POLITICS','WHO HAD\nINFLUENCE?','The company acknowledged senior U.S. government input. Trump said he urged Huang’s return. That establishes involvement, not illegal trading.','audit',[
        {label:'NVIDIA',value:'GOVERNMENT INPUT'},{label:'TRUMP',value:'PUBLIC INTERVENTION'},{label:'TRADING CRIME',value:'NOT ESTABLISHED'}
      ],'CORPORATE STATEMENT / REUTERS REPORTING'),
      scene('premarket','EARLIER PRICE MOVES','TIMING IS\nNOT PROOF.','Shares moved before the announcement. Public advocacy for Huang and a wider market rebound are alternative explanations that must be tested.','compare',[
        {label:'QUESTION',value:'WHO KNEW WHEN?'},{label:'ALTERNATIVE',value:'PUBLIC SIGNALS'},{label:'NEEDED',value:'TRADE RECORDS'}
      ],'ILLUSTRATIVE TIMING COMPARISON / NO INTRADAY SERIES'),
      scene('evidence','DISTINGUISH FACT / ALLEGATION','SEPARATE\nTHE CLAIMS.','Confirmed: board action, political input, big stock moves. Unproven: a coordinated illegal trading scheme.','audit',[
        {label:'VERIFIED',value:'BOARD + MARKET'},{label:'REPORTED',value:'INTERVENTION'},{label:'UNPROVEN',value:'INSIDER SCHEME'}
      ],'NO PUBLIC EVIDENCE HERE PROVES ILLEGAL INSIDER TRADING'),
      scene('payoff','FOLLOW THE EVIDENCE','ASK THE\nRIGHT QUESTIONS.','What information was private? Who received it? What trades occurred? And what did regulators actually establish?','checklist',[
        {label:'1',value:'INFORMATION'},{label:'2',value:'TIMESTAMPS'},{label:'3',value:'ORDER RECORDS'}
      ],'SOURCES: NVIDIA 8-K / REUTERS / AP / FED / CPI')
    ]
  },
  {
    id:'AgentProgrammingFluid60',title:'Program an AI agent',series:'AI MASTERCLASS 01 / BUILD',
    accent:'#69DBE7',secondary:'#EDBA75',secondaryAccent:'#94D0FF',
    overlap:30,fps:60,width:1080,height:1920,
    scenes:[
      scene('hook','AI MASTERCLASS / BUILD','AN AGENT\nIS A LOOP.','The model thinks through a task. Tools retrieve information or perform constrained actions. The result is checked before anything is trusted.','network',[
        {label:'INPUT',value:'USER GOAL'},{label:'REASON',value:'MODEL'},{label:'TOOL',value:'GUARDED CALL'}
      ],'ORIGINAL EDUCATIONAL SYSTEM / SIMULATED TOOL RESULTS'),
      scene('boundary','DESIGN FIRST','DRAW THE\nBOUNDARIES.','Start with one problem. Here: a helpdesk assistant reads ticket status but cannot approve or delete anything.','policy',[
        {label:'SCOPE',value:'READ ONLY'},{label:'CAN',value:'LOOK UP TICKET'},{label:'CANNOT',value:'CHANGE ACCESS'}
      ],'LEAST PRIVILEGE / NO LIVE HELPDESK SYSTEM'),
      scene('components','THE THREE-PIECE CORE','MODEL +\nTOOLS + RULES.','The agent receives instructions. A typed tool exposes only approved capabilities. Your code validates the returned data.','network',[
        {label:'AGENT',value:'INSTRUCTIONS'},{label:'TOOL',value:'FUNCTION'},{label:'TEST',value:'VALIDATOR'}
      ]),
      scene('function','PYTHON / SAFE TOOL','DEFINE THE\nTOOL FIRST.','This tool performs a local read-only lookup. The model cannot bypass the Python function’s permitted behavior.','code',[
        {label:'01',value:'@function_tool'},
        {label:'02',value:'def lookup_ticket(id: str):'},
        {label:'03',value:'    return database.get(id)'}
      ],'DEMO CODE / database IS LOCAL SAMPLE DATA'),
      scene('connect','PYTHON / AGENT SETUP','CONNECT THE\nBOUNDARY.','Give the agent specific instructions and only the approved tool. Each added capability increases the permission surface.','code',[
        {label:'01',value:'agent = Agent('},{label:'02',value:'  name="Triage",'},
        {label:'03',value:'  tools=[lookup_ticket])'}
      ],'OPENAI AGENTS SDK / EDUCATIONAL EXCERPT'),
      scene('run','A CONTROLLED EXECUTION','TRACE THE\nREQUEST.','A user requests ticket T-104. The model selects a tool. The tool checks the allowed record and returns a response.','network',[
        {label:'USER',value:'CHECK T-104'},{label:'TOOL',value:'lookup_ticket'},{label:'RESULT',value:'PENDING APPROVAL'}
      ],'SIMULATED EXECUTION / NOT A LIVE API CALL'),
      scene('verify','REAL ENGINEERING','DON’T TRUST\nONE OUTPUT.','Test missing tickets, invalid identifiers and attempts to exceed tool permissions. Keep a trace for troubleshooting.','audit',[
        {label:'VALID ID',value:'PASS'},{label:'UNKNOWN ID',value:'NOT FOUND'},{label:'WRITE REQUEST',value:'DENIED'}
      ],'TEST CONTRACT / EXPECTED RESULTS, NOT LIVE OBSERVATIONS'),
      scene('protect','SECURITY / TOOL USE','PUT POLICY\nIN CODE.','Prompt instructions help. But permissions, validation and approvals belong in application logic, not only in a sentence to the model.','policy',[
        {label:'TOOL GRANTS',value:'MINIMUM'},{label:'VALIDATION',value:'SERVER-SIDE'},{label:'APPROVAL',value:'HUMAN GATE'}
      ]),
      scene('challenge','BUILD IT YOURSELF','YOUR FIRST\nAGENT LAB.','Create one harmless lookup tool, inspect the call trace and write three tests before expanding the agent’s authority.','checklist',[
        {label:'01',value:'TOOL'},{label:'02',value:'TRACE'},{label:'03',value:'TEST'}
      ],'FULL CODE + TESTS BELONG IN THE COMPANION REPOSITORY')
    ]
  },
  {
    id:'PromptEngineeringFluid60',title:'Prompt AI like an engineer',series:'AI MASTERCLASS 02 / PROMPT',
    accent:'#B69BFF',secondary:'#7DDFE6',secondaryAccent:'#FFD38C',
    overlap:30,fps:60,width:1080,height:1920,
    scenes:[
      scene('hook','AI MASTERCLASS / PROMPT','MORE WORDS\nIS NOT THE FIX.','A reliable prompt behaves like a task specification: objective, evidence, constraints and measurable output.','compare',[
        {label:'VAGUE',value:'ANALYZE THIS'},{label:'SPECIFIC',value:'VERIFY CLAIMS'},{label:'MEASURE',value:'FAIL CONDITIONS'}
      ]),
      scene('bad','WEAK INPUT','HERE’S THE\nBAD PROMPT.','“Summarize this security incident.” It leaves the model to guess the audience, source standard and required structure.','prompt',[
        {label:'TASK',value:'SUMMARIZE'},{label:'SOURCES',value:'NOT DEFINED'},{label:'OUTPUT',value:'NOT DEFINED'}
      ],'ILLUSTRATIVE PROMPT / NO MODEL CALL'),
      scene('spec','FIX THE CONTRACT','DEFINE THE\nOUTPUT.','Tell the model who needs the answer, what documents are authoritative, and what a good result must contain.','policy',[
        {label:'AUDIENCE',value:'SOC ANALYST'},{label:'SOURCE',value:'INCIDENT LOG'},{label:'FORMAT',value:'FACT / UNKNOWN'}
      ]),
      scene('rewrite','IMPROVED PROMPT / LIVE SPEC','SHOW THE\nDIFFERENCE.','“Using only the incident log, identify observed events, unknowns and recommended checks. Cite timestamps. Do not invent evidence.”','prompt',[
        {label:'EVIDENCE',value:'ONLY THE LOG'},{label:'REQUIRE',value:'TIMESTAMPS'},{label:'BLOCK',value:'UNSUPPORTED CLAIMS'}
      ],'EXAMPLE SPECIFICATION / NO HIDDEN SOURCES'),
      scene('trace','EVIDENCE / REASONING','ANCHOR EACH\nCONCLUSION.','Separate what the source says from what you infer. Ask for missing evidence to be marked unknown, not filled in.','network',[
        {label:'INPUT',value:'LOG LINE'},{label:'EXTRACT',value:'OBSERVATION'},{label:'OUTPUT',value:'SUPPORTED FACT'}
      ]),
      scene('format','STRUCTURED OUTPUT','MAKE IT\nTESTABLE.','A simple JSON shape can require facts, uncertainties and follow-up checks. Validate it before showing the result to anyone.','code',[
        {label:'01',value:'{"facts": [...],'},
        {label:'02',value:' "unknowns": [...],'},
        {label:'03',value:' "checks": [...]}'}
      ],'SCHEMATIC JSON SHAPE / NOT AN ACTUAL MODEL RESPONSE'),
      scene('evaluate','THE EVALUATOR','CATCH THE\nHALLUCINATION.','If the response claims an attacker was identified but the log does not support that conclusion, the output fails.','audit',[
        {label:'SUPPORTED',value:'ACCEPT'},{label:'UNSOURCED',value:'REJECT'},{label:'REVISION',value:'RE-QUERY'}
      ],'DEMONSTRATION / ILLUSTRATIVE VALIDATOR RESULTS'),
      scene('iterate','CHANGE ONE THING','TEST YOUR\nNEXT VERSION.','Hold the source and scoring rubric steady. Change one prompt instruction and compare both outputs against the same tests.','timeline',[
        {label:'BASELINE',value:'PROMPT A'},{label:'REVISION',value:'PROMPT B'},{label:'RUBRIC',value:'SAME TEST'}
      ]),
      scene('payoff','TAKEAWAY / PROMPT CONTRACT','SPECIFY.\nVERIFY. ITERATE.','The best prompt is not the one that sounds smartest. It is the one whose output can be checked.','checklist',[
        {label:'INPUT',value:'TRUSTED SOURCES'},{label:'OUTPUT',value:'DEFINED FORMAT'},{label:'REVIEW',value:'TEST + REVISE'}
      ],'DO NOT PUT SECRETS OR PRIVATE CLIENT DATA IN PROMPTS')
    ]
  },
] as const;

export const getDuration = (p: FluidEpisode): number =>
  p.scenes.reduce((total, s) => total + s.duration, 0) - (p.scenes.length - 1) * p.overlap;

export const validateFluid = (p: FluidEpisode): void => {
  if (p.fps !== 60 || p.width !== 1080 || p.height !== 1920) throw new Error('60fps 1080x1920 required');
  if (p.overlap !== 30 || p.scenes.length < 7) throw new Error('Required 30-frame overlap and 7+ scenes');
  const seen = new Set<string>();
  p.scenes.forEach(s=>{
    if (seen.has(s.id) || s.duration < 300 || s.rows.length < 2 || !s.headline.trim()) throw new Error('Invalid beat '+s.id);
    seen.add(s.id);
  });
};
