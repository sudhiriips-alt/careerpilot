const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist/staging');
const read=p=>fs.readFileSync(path.join(out,p),'utf8');
function publicFile(url){
 if(/^(https?:|data:|#)/.test(url))return;
 const name=url.replace(/^\.\//,'');
 assert.ok(fs.statSync(path.join(out,name)).isFile(),`Missing local reference ${url}`);
}
test('staging isolation and public asset references',()=>{
 const cfg=JSON.parse(fs.readFileSync(path.join(root,'wrangler.staging.json')));
 assert.equal(cfg.name,'careerpilot-staging');assert.equal(cfg.assets.directory,'./dist/staging');
 assert.equal(cfg.workers_dev,true);assert.equal(cfg.preview_urls,true);
 assert.equal(cfg.assets.not_found_handling,'none');
 for(const key of ['main','routes','route','env','account_id','zone_id'])assert.equal(cfg[key],undefined);
 const html=read('index.html');
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g))publicFile(match[1]);
 const manifest=JSON.parse(read('manifest.webmanifest'));
 publicFile(manifest.start_url);manifest.icons.forEach(icon=>publicFile(icon.src));
 const sw=read('sw.js');const precache=sw.match(/const ASSETS=(\[[^;]+\])/)[1];
 for(const asset of JSON.parse(precache.replaceAll("'",'"')))if(asset!=='./')publicFile(asset);
 for(const match of read('resume-import.js').matchAll(/['"]\.\/(vendor\/[^'"]+)['"]/g))publicFile(match[1]);
 for(const file of ['app.js','cloud.js','resume-import.js','sw.js','firebase-config.js'])new vm.Script(read(file));
 assert.match(read('_headers'),/X-Robots-Tag: noindex, nofollow/);
 assert.match(read('_headers'),/Service-Worker-Allowed: \//);
});
test('staging package excludes source/configuration/test/secret files and preserves asset bytes',()=>{
 const entries=[];
 function walk(dir,prefix=''){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const name=prefix+item.name;if(item.isDirectory())walk(path.join(dir,item.name),name+'/');else entries.push(name);
 }}walk(out);
 assert.equal(entries.length,15);
 for(const file of entries){
  assert.ok(!/(^|\/)(\.|tests|scripts)|\.md$|firestore|firebase\.json|wrangler/.test(file),file);
  if(file!=='_headers')assert.deepEqual(fs.readFileSync(path.join(out,file)),fs.readFileSync(path.join(root,file)),file);
 }
});
