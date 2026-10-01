/* Repaso LEINN - funcionamiento sin conexion.
   Version 8f4f32e32a36 (cambia sola en cada reconstruccion del mazo). */
var V = 'repaso-8f4f32e32a36';
var ASSETS = ['./', './index.html', './manifest.webmanifest',
              './icon-180.png', './icon-512.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ if(k !== V) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;

  // La app: primero la red (para ver el mazo nuevo), y si no hay cobertura, la copia guardada.
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(function(res){
        var copia = res.clone();
        caches.open(V).then(function(c){ c.put('./index.html', copia); });
        return res;
      }).catch(function(){
        return caches.match('./index.html').then(function(r){ return r || caches.match('./'); });
      })
    );
    return;
  }

  // Lo demas: primero la copia guardada.
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        var copia = res.clone();
        caches.open(V).then(function(c){ c.put(e.request, copia); });
        return res;
      });
    })
  );
});
