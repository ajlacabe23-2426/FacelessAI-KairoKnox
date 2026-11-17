import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const states = new Set(['idea','researching','scripted','approved','produced','published']);
const errors = [];
function file(relative) {
  if (typeof relative !== 'string' || !relative || relative.startsWith('/') || relative.includes('..')) {
    errors.push('Unsafe or absent path: ' + String(relative)); return false;
  }
  if (!fs.existsSync(path.join(root,relative))) {
    errors.push('File not found: ' + relative); return false;
  }
  return true;
}
function read(relative) {
  if (!file(relative)) return null;
  try { return JSON.parse(fs.readFileSync(path.join(root,relative),'utf8')); }
  catch(e) { errors.push('JSON parse error in ' + relative + ': ' + e.message); return null; }
}
function validDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z'));
}
const registry = read('episodes/registry.json');
if (!Array.isArray(registry)) errors.push('Registry must be an array');
else {
  const ids = new Set();
  for (const e of registry) {
    if (!e || typeof e !== 'object') { errors.push('Invalid episode record'); continue; }
    if (!/^ep\d{2}$/.test(e.id || '') || ids.has(e.id)) errors.push('Invalid/duplicate episode ID: ' + e.id);
    ids.add(e.id);
    if (!states.has(e.state)) errors.push('Invalid state for ' + e.id);
    if (!e.title || typeof e.title !== 'string') errors.push('Missing title for ' + e.id);
    if (e.state === 'published' && !validDate(e.published_on)) errors.push('Published episode requires valid date: ' + e.id);
    if (e.published_on && !validDate(e.published_on)) errors.push('Invalid publication date for ' + e.id);
    if (e.brief) file(e.brief);
    if (e.script) file(e.script);
    if (e.shotlist) file(e.shotlist);
    if (e.ledger) {
      const ledger = read(e.ledger);
      if (!ledger) continue;
      if (!Array.isArray(ledger.sources) || !Array.isArray(ledger.claims)) {
        errors.push('Ledger must have sources and claims arrays: ' + e.ledger); continue;
      }
      const sid = new Set();
      for (const s of ledger.sources) {
        if (!s.id || sid.has(s.id)) errors.push('Missing/duplicate source ID in ' + e.ledger);
        sid.add(s.id);
        if (!s.title || !s.publisher || !validDate(s.published_on)) errors.push('Incomplete source in ' + e.ledger);
        try { if (new URL(s.url).protocol !== 'https:') errors.push('Source must use HTTPS: ' + s.id); }
        catch { errors.push('Bad source URL: ' + s.id); }
      }
      const cid = new Set();
      for (const c of ledger.claims) {
        if (!c.id || cid.has(c.id)) errors.push('Missing/duplicate claim ID in ' + e.ledger);
        cid.add(c.id);
        if (typeof c.statement !== 'string' || c.statement.length < 12) errors.push('Claim needs statement: ' + c.id);
        if (!Array.isArray(c.source_ids) || !c.source_ids.length || c.source_ids.some(id=>!sid.has(id))) errors.push('Claim has missing source references: ' + c.id);
      }
    }
  }
}
if (errors.length) { for (const err of errors) console.error('FAIL: ' + err); process.exitCode=1; }
else {
  console.log('PASS: episode metadata, file references and source links structurally valid.');
  console.log('NOTICE: this does not independently verify factual claims or live URLs.');
}
