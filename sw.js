// Простая offline-оболочка (cache-first)
const CACHE = 'inv-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))) .then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // только GET и в пределах нашего приложения
  if (e.request.method!=='GET' || (url.origin !== location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp=>{
      // кэшируем навигацию и статику
      if (resp.ok && (e.request.mode==='navigate' || ASSETS.some(a=>url.pathname.endsWith(a.replace('./','/'))))){
        const copy = resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy));
      }
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
