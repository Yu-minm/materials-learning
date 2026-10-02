/* Scope-limited cache. Program and text updates are checked online first. */
const PREFIX='materials-learning-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+'c95e538c3089';
const CORE=["app/app.js","app/components/common.js","app/components/text.js","app/components/trend.js","app/components/viewer.js","app/features/figures.js","app/features/history.js","app/features/home.js","app/features/quiz-mode.js","app/features/reader.js","app/features/search-mode.js","app/features/terms.js","app/features/weak.js","app/lib/context.js","app/lib/dom.js","app/lib/quiz.js","app/lib/router.js","app/lib/search.js","app/lib/storage.js","app/lib/types.js","data/catalog.json","favicon.svg","index.html","styles.css"];
const MATERIALS=["figures/c1-f1.jpg?scan=2026-10-02.scan.1","figures/c1-f10.jpg?scan=2026-10-02.scan.1","figures/c1-f11.jpg?scan=2026-10-02.scan.1","figures/c1-f12.jpg?scan=2026-10-02.scan.1","figures/c1-f13.jpg?scan=2026-10-02.scan.1","figures/c1-f14.jpg?scan=2026-10-02.scan.1","figures/c1-f15.jpg?scan=2026-10-02.scan.1","figures/c1-f16.jpg?scan=2026-10-02.scan.1","figures/c1-f17.jpg?scan=2026-10-02.scan.1","figures/c1-f18.jpg?scan=2026-10-02.scan.1","figures/c1-f19.jpg?scan=2026-10-02.scan.1","figures/c1-f2.jpg?scan=2026-10-02.scan.1","figures/c1-f20.jpg?scan=2026-10-02.scan.1","figures/c1-f21.jpg?scan=2026-10-02.scan.1","figures/c1-f3.jpg?scan=2026-10-02.scan.1","figures/c1-f4.jpg?scan=2026-10-02.scan.1","figures/c1-f5.jpg?scan=2026-10-02.scan.1","figures/c1-f6.jpg?scan=2026-10-02.scan.1","figures/c1-f7.jpg?scan=2026-10-02.scan.1","figures/c1-f8.jpg?scan=2026-10-02.scan.1","figures/c1-f9.jpg?scan=2026-10-02.scan.1","figures/c2-f1.jpg?scan=2026-10-02.scan.1","figures/c2-f2.jpg?scan=2026-10-02.scan.1","figures/c2-f3.jpg?scan=2026-10-02.scan.1","figures/c2-f4.jpg?scan=2026-10-02.scan.1","figures/c2-f5.jpg?scan=2026-10-02.scan.1","figures/c2-f6.jpg?scan=2026-10-02.scan.1","figures/c2-f7.jpg?scan=2026-10-02.scan.1","figures/c2-f8.jpg?scan=2026-10-02.scan.1","figures/c2-f9.jpg?scan=2026-10-02.scan.1","figures/c2-t1.jpg?scan=2026-10-02.scan.1","figures/c3-f1.jpg?scan=2026-10-02.scan.1","figures/c3-f10.jpg?scan=2026-10-02.scan.1","figures/c3-f11.jpg?scan=2026-10-02.scan.1","figures/c3-f12.jpg?scan=2026-10-02.scan.1","figures/c3-f13.jpg?scan=2026-10-02.scan.1","figures/c3-f14.jpg?scan=2026-10-02.scan.1","figures/c3-f15.jpg?scan=2026-10-02.scan.1","figures/c3-f2.jpg?scan=2026-10-02.scan.1","figures/c3-f3.jpg?scan=2026-10-02.scan.1","figures/c3-f4.jpg?scan=2026-10-02.scan.1","figures/c3-f5.jpg?scan=2026-10-02.scan.1","figures/c3-f6.jpg?scan=2026-10-02.scan.1","figures/c3-f7.jpg?scan=2026-10-02.scan.1","figures/c3-f8.jpg?scan=2026-10-02.scan.1","figures/c3-f9.jpg?scan=2026-10-02.scan.1","figures/c3-img3.jpg?scan=2026-10-02.scan.1","figures/c3-img4.jpg?scan=2026-10-02.scan.1","figures/c3-img5.jpg?scan=2026-10-02.scan.1","pages/p283.jpg?scan=2026-10-02.scan.1","pages/p284.jpg?scan=2026-10-02.scan.1","pages/p285.jpg?scan=2026-10-02.scan.1","pages/p286.jpg?scan=2026-10-02.scan.1","pages/p287.jpg?scan=2026-10-02.scan.1","pages/p288.jpg?scan=2026-10-02.scan.1","pages/p289.jpg?scan=2026-10-02.scan.1","pages/p290.jpg?scan=2026-10-02.scan.1","pages/p291.jpg?scan=2026-10-02.scan.1","pages/p292.jpg?scan=2026-10-02.scan.1","pages/p293.jpg?scan=2026-10-02.scan.1","pages/p294.jpg?scan=2026-10-02.scan.1","pages/p295.jpg?scan=2026-10-02.scan.1","pages/p296.jpg?scan=2026-10-02.scan.1","pages/p297.jpg?scan=2026-10-02.scan.1","pages/p298.jpg?scan=2026-10-02.scan.1","pages/p299.jpg?scan=2026-10-02.scan.1","pages/p300.jpg?scan=2026-10-02.scan.1","pages/p301.jpg?scan=2026-10-02.scan.1","pages/p302.jpg?scan=2026-10-02.scan.1","pages/p303.jpg?scan=2026-10-02.scan.1","pages/p304.jpg?scan=2026-10-02.scan.1","pages/p305.jpg?scan=2026-10-02.scan.1","pages/p306.jpg?scan=2026-10-02.scan.1","pages/p307.jpg?scan=2026-10-02.scan.1","pages/p40.jpg?scan=2026-10-02.scan.1","pages/p41.jpg?scan=2026-10-02.scan.1","pages/p42.jpg?scan=2026-10-02.scan.1","pages/p43.jpg?scan=2026-10-02.scan.1","pages/p44.jpg?scan=2026-10-02.scan.1","pages/p45.jpg?scan=2026-10-02.scan.1","pages/p46.jpg?scan=2026-10-02.scan.1","pages/p47.jpg?scan=2026-10-02.scan.1","pages/p48.jpg?scan=2026-10-02.scan.1","pages/p49.jpg?scan=2026-10-02.scan.1","pages/p50.jpg?scan=2026-10-02.scan.1"];
const url=p=>new URL(p,self.registration.scope).href;
const coreURLs=new Set(CORE.map(url));
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(cache=>cache.addAll(CORE.map(url))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 const request=event.request,target=new URL(request.url);
 if(request.method!=='GET'||target.origin!==self.location.origin||!target.href.startsWith(self.registration.scope))return;
 // Diagnostics always use the network; original scan images are not cached.
 if(target.pathname.includes('/originals/')||target.pathname.endsWith('/check.html')||target.pathname.endsWith('/deployment.json')||target.searchParams.has('verify'))return;
 const key=new URL(target.href);key.search='';key.hash='';
 const onlineFirst=request.mode==='navigate'||coreURLs.has(key.href);
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const fallback=async()=>await cache.match(request)||await cache.match(key.href)||(request.mode==='navigate'?await cache.match(url('index.html')):undefined)||Response.error();
  const network=async()=>{
   const response=await fetch(request);
   if(response.ok&&!response.redirected){const copy=response.clone();event.waitUntil(cache.put(request,copy).catch(()=>{}));}
   return response;
  };
  if(onlineFirst){try{const response=await network();if(response.status>=500){const saved=await cache.match(key.href);if(saved)return saved;}return response;}catch{return fallback();}}
  const saved=await cache.match(request);if(saved)return saved;
  try{return await network();}catch{return fallback();}
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_MATERIALS')return;
 const port=event.ports[0];
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(CACHE);let count=0;
   for(const asset of MATERIALS){const key=url(asset);if(!await cache.match(key))await cache.add(key);port?.postMessage({current:++count,total:MATERIALS.length});}
   port?.postMessage({done:true});
  }catch(error){port?.postMessage({error:'\u30aa\u30d5\u30e9\u30a4\u30f3\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002\u901a\u4fe1\u72b6\u614b\u3068\u7a7a\u304d\u5bb9\u91cf\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002 '+String(error)});}
 })());
});
