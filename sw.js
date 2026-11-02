// Network-first for source assets to prevent stale deployments. Never cache Firestore or auth responses.
const CACHE='careerpilot-growth-v1';const ASSETS=['./','./index.html','./styles.css','./app.js','./cloud.js','./resume-import.js','./job-match.js','./vendor/mammoth.browser.min.js','./vendor/pdf.mjs','./vendor/pdf.worker.mjs','./firebase-config.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)))});
