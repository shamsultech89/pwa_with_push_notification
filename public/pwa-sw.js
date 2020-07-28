// self.addEventListener('install', function(event) {
//   event.waitUntil(preLoad());
// });

// var preLoad = function() {
//   return caches.open('pwa-offline').then(function(cache) {
//     console.log('Opened cache');
//     return cache.addAll(['/offline']);
//   });
// };

// self.addEventListener('fetch', function(event) {
//   event.respondWith(checkResponse(event.request).catch(function() {
//     return returnFromCache(event.request);
//   }));
//   event.waitUntil(addToCache(event.request));
// });

// var checkResponse = function(request) {
//   return new Promise(function(fulfill, reject) {
//     fetch(request).then(function(response) {
//       if (response.status !== 404) {
//         fulfill(response);
//       } else {
//         reject();
//       }
//     }, reject);
//   });
// };

// var addToCache = function(request) {
//   return caches.open('pwa-offline').then(function(cache) {
//     return fetch(request).then(function(response) {
//       if (request.url)
//         return cache.put(request, response);
//     });
//   });
// };

// var returnFromCache = function(request) {
//   return caches.open('pwa-offline').then(function(cache) {
//     return cache.match(request).then(function(matching) {
//       if (!matching || matching.status == 404) {
//         return cache.match('offline');
//       } else {
//         return matching;
//       }
//     });
//   });
// };







'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'pwa-offline';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/offline'
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Refresh the cache when service worker install
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Show the offline content when internet is not available
self.addEventListener('fetch', function(event) {
  event.respondWith(checkResponse(event.request).catch(function() {
    return returnFromCache(event.request);
  }));
  event.waitUntil(addToCache(event.request));
});

var checkResponse = function(request) {
  return new Promise(function(fulfill, reject) {
    fetch(request).then(function(response) {
      if (response.status !== 404) {
        fulfill(response);
      } else {
        reject();
      }
    }, reject);
  });
};

var addToCache = function(request) {
  return caches.open('pwa-offline').then(function(cache) {
    return fetch(request).then(function(response) {
      if (request.url)
        return cache.put(request, response);
    });
  });
};

var returnFromCache = function(request) {
  return caches.open('pwa-offline').then(function(cache) {
    return cache.match(request).then(function(matching) {
      if (!matching || matching.status == 404) {
        return cache.match('offline');
      } else {
        return matching;
      }
    });
  });
};


// Show push notification
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  var json_data = JSON.parse(event.data.text());
  var title = json_data['message'];
  var options = {
    body: "We have received a push message",
    icon: '/assets/icons/icon-128x128.png',
    badge: '/assets/icons/icon-128x128.png',
    data: { url: json_data['url'] },
    actions: [{action: "open_url", title: "Read Now"}]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});


// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');

  var action = event.notification.actions[0];
  event.notification.close();
  switch(action['action']){
    case 'open_url':
    clients.openWindow(event.notification.data.url); //which we got from above
    break;
    case 'any_other_action':
    clients.openWindow('/');
    break;
  }

  // event.waitUntil(
  //   clients.openWindow('https://developers.google.com/web')
  // );
});


function onPushSubscriptionChange(event) {
  logger.log("Push subscription change event detected", event);
}

self.addEventListener("pushsubscriptionchange", onPushSubscriptionChange);
