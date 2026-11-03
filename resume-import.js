'use strict';
// Local parsers only: the original document and extracted text never leave this browser.
window.ResumeImport = (() => {
 const MAX_BYTES=5*1024*1024, MAX_TEXT=100000;
 const fields={fullName:'Full name',email:'Contact email',phone:'Phone',location:'Location',headline:'Professional title',website:'LinkedIn / portfolio URL',summary:'Professional summary',experience:'Experience',education:'Education',skills:'Skills',projects:'Projects',certifications:'Certifications'};
 function mapText(text){
  const lines=text.replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);
  const result={};let section=null;
  const headings={summary:/^(professional summary|summary|profile|objective)$/i,experience:/^(work experience|professional experience|experience|employment history)$/i,education:/^(education|education and qualifications|qualifications)$/i,skills:/^(skills|technical skills|core competencies)$/i,projects:/^(projects|projects and achievements)$/i,certifications:/^(certifications|certificates|licenses)$/i};
  const contact=lines.slice(0,12).join('\n');
  result.email=contact.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0]||'';
  result.phone=contact.match(/(?:\+?\d[\d ().-]{7,}\d)/)?.[0]||'';
  result.website=contact.match(/https?:\/\/[^\s<>]+/i)?.[0]||'';
  for(const line of lines){
   const heading=Object.keys(headings).find(k=>headings[k].test(line.replace(/:$/,'')));
   if(heading){section=heading;continue}
   if(section)result[section]=[result[section],line].filter(Boolean).join('\n');
  }
  const first=lines[0]||'';
  if(/^[\p{L} .'-]{2,80}$/u.test(first)&&!Object.values(headings).some(re=>re.test(first)))result.fullName=first;
  for(const line of lines.slice(0,12)){
   const m=line.match(/^(location|headline|title)\s*:\s*(.+)$/i);
   if(m)result[m[1].toLowerCase()==='location'?'location':'headline']=m[2];
  }
  return Object.fromEntries(Object.entries(result).filter(([,v])=>v));
 }
 async function extract(file){
  if(!file||!file.size||file.size>MAX_BYTES)throw Error('Choose a non-empty PDF or DOCX up to 5 MB.');
  const ext=file.name.split('.').pop().toLowerCase();
  if(!['pdf','docx'].includes(ext))throw Error('Only PDF and DOCX files are supported.');
  const buffer=await file.arrayBuffer();let text='';
  if(ext==='pdf'){
   if(new TextDecoder().decode(buffer.slice(0,5))!=='%PDF-')throw Error('This file is not a valid PDF.');
   const pdfjs=await import('./vendor/pdf.mjs');
   pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.mjs',location.href).href;
   const task=pdfjs.getDocument({data:new Uint8Array(buffer),isEvalSupported:false,stopAtErrors:true});
   let pdf;
   try{
    pdf=await task.promise;
    if(pdf.numPages>30)throw Error('Use a resume with 30 pages or fewer.');
    for(let n=1;n<=pdf.numPages;n++){
     const page=await pdf.getPage(n), content=await page.getTextContent();let lastY=null;
     for(const item of content.items){if(!('str'in item))continue;const y=item.transform[5];if(lastY!==null&&Math.abs(y-lastY)>3)text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=y;}
     text+='\n';page.cleanup();if(text.length>MAX_TEXT)throw Error('Resume text exceeds 100,000 characters.');
    }
   }finally{await task.destroy()}
  }else{
   if(new Uint8Array(buffer)[0]!==80||new Uint8Array(buffer)[1]!==75)throw Error('This file is not a valid DOCX.');
   text=(await mammoth.extractRawText({arrayBuffer:buffer})).value;
  }
  text=text.trim();
  if(!text)throw Error('No readable text found. Scanned PDFs need OCR; use a text-based PDF or DOCX.');
  if(text.length>MAX_TEXT)throw Error('Resume text exceeds 100,000 characters.');
  return {text,values:mapText(text)};
 }
 return {fields,mapText,extract};
})();
