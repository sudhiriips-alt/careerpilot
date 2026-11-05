/* CareerPilot evidence-based local JD alignment; no model or network calls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.CareerMatch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const stop=new Set(('a an and are as at be by for from has have in into is it of on or our the their this to with you your we us will can should must required requires preferred experience years year role job work ability strong excellent good knowledge proven demonstrated').split(' '));
function words(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').match(/[a-z][a-z0-9+#./-]{1,}/g)||[];}
function tokens(s){return [...new Set(words(s).map(x=>x.replace(/^[^a-z]+|[^a-z0-9+#]+$/g,'')).filter(x=>x.length>2&&!stop.has(x)))];}
function classifyRequirements(description){
 const sentences=String(description||'').split(/(?<=[.!?;])\s+|\n+/).map(s=>s.trim()).filter(Boolean);
 const required=[],preferred=[];
 for(const sentence of sentences){const lower=sentence.toLowerCase();const target=/(preferred|desirable|nice to have|bonus|advantage|ideally|would be an asset)/.test(lower)?preferred:required;for(const term of tokens(sentence))if(!target.includes(term))target.push(term);}
 return {required,preferred};
}
function analyze(jd,resume){
 const desc=String(jd||'').trim(),cv=String(resume||'').trim();
 if(desc.length<40)throw Error('Paste at least 40 characters of a genuine job description.');
 if(!cv)throw Error('Add your own resume or profile details before comparing.');
 const dt=tokens(desc),rt=new Set(tokens(cv)),groups=classifyRequirements(desc);
 const matched=dt.filter(t=>rt.has(t)),missing=dt.filter(t=>!rt.has(t));
 const split=list=>({matched:list.filter(t=>rt.has(t)),missing:list.filter(t=>!rt.has(t))});
 const required=split(groups.required),preferred=split(groups.preferred);
 const coverage=dt.length?Math.round(100*matched.length/dt.length):0;
 const requiredCoverage=groups.required.length?Math.round(100*required.matched.length/groups.required.length):0;
 return {coverage,requiredCoverage,matched,missing,required,preferred,total:dt.length,note:'Keyword coverage is a vocabulary comparison, not an ATS score, hiring probability or qualification assessment. Required/preferred grouping is a text heuristic; review the original job description. Missing terms are prompts for review, not proof of missing skills.'};
}
return {analyze,tokens,classifyRequirements};
});
