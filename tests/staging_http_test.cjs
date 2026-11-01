// Run only against local Wrangler or the separate staging host, never production.
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.STAGING_TEST_URL;
test('Cloudflare asset bytes, MIME types, headers, 404s and private-file exclusion',{skip:!base},async()=>{
 const url=new URL(base);
 assert.ok(['127.0.0.1','localhost'].includes(url.hostname)||/^([a-z0-9-]+-)?careerpilot-staging\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname),'Refuse non-staging host');
 const files={'index.html':/text\/html/,'app.js':/(java|ecma)script/,'cloud.js':/(java|ecma)script/,'resume-import.js':/(java|ecma)script/,'styles.css':/text\/css/,'sw.js':/(java|ecma)script/,'firebase-config.js':/(java|ecma)script/,'vendor/pdf.mjs':/(java|ecma)script/,'vendor/pdf.worker.mjs':/(java|ecma)script/,'vendor/mammoth.browser.min.js':/(java|ecma)script/,'icon.svg':/image\/svg\+xml/,'manifest.webmanifest':/json|manifest/};
 for(const [file,mime] of Object.entries(files)){
  const res=await fetch(new URL(file,url));assert.equal(res.status,200,file);
  assert.match(res.headers.get('content-type')||'',mime,file);
  assert.deepEqual(Buffer.from(await res.arrayBuffer()),fs.readFileSync(path.join(__dirname,'../dist/staging',file)),file);
  assert.equal(res.headers.get('x-content-type-options'),'nosniff',file);
  assert.match(res.headers.get('x-robots-tag')||'',/noindex/,file);
  if(['sw.js','firebase-config.js'].includes(file))assert.match(res.headers.get('cache-control')||'',/no-store/,file);
 }
 assert.equal((await fetch(url)).status,200);
 for(const file of ['missing.js','vendor/missing.mjs','.git/config','firestore.rules','firebase.json','wrangler.staging.json','tests/cloud_import_test.cjs','README.md','_headers'])assert.equal((await fetch(new URL(file,url))).status,404,file);
});
