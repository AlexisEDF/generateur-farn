const CACHE_NAME = 'farn-stock-v1';

// Voici la liste de TOUT ce que l'application doit sauvegarder pour marcher sans internet
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './logo-edf.png',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Installation : on met tout en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Utilisation : on sert les fichiers depuis le cache si on est hors-ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si le fichier est dans le cache, on le donne, sinon on va le chercher sur internet
        return response || fetch(event.request);
      })
  );
});