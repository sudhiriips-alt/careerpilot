// Copy only public application assets; never publish the repository root.
import {readFile, mkdir, copyFile, rm, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config=JSON.parse(await readFile(resolve(root,'wrangler.staging.json'),'utf8'));
if(config.name!=='careerpilot-staging'||config.assets?.directory!=='./dist/staging'||
   config.main||config.routes||config.route||config.env||config.account_id||config.zone_id||
   config.workers_dev!==true||config.preview_urls!==true)throw Error('Unsafe staging configuration');
const files=[
 'index.html','app.js','cloud.js','resume-import.js','styles.css','sw.js',
 'firebase-config.js','icon.svg','manifest.webmanifest',
 'vendor/mammoth.browser.min.js','vendor/pdf.mjs','vendor/pdf.worker.mjs',
 'vendor/mammoth-LICENSE','vendor/pdfjs-LICENSE'
];
const out=resolve(root,'dist/staging');
await mkdir(resolve(root,'dist'),{recursive:true});
if((await lstat(resolve(root,'dist'))).isSymbolicLink())throw Error('dist must not be a symlink');
await rm(out,{recursive:true,force:true});
for(const file of files){
 const source=resolve(root,file);
 if(!(await lstat(source)).isFile())throw Error('Asset must be a regular file: '+file);
 await mkdir(dirname(resolve(out,file)),{recursive:true});
 await copyFile(source,resolve(out,file));
}
await copyFile(resolve(root,'cloudflare/staging-headers'),resolve(out,'_headers'));
console.log(`Built ${files.length} public assets + staging headers for careerpilot-staging.`);
