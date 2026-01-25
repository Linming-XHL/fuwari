// Service Worker for PWA
const CACHE_NAME = 'lmxhl-blog-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon/favicon-light-32.png',
  '/favicon/favicon-light-192.png',
  '/manifest.json'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// 处理请求
self.addEventListener('fetch', (event) => {
  // 忽略非GET请求
  if (event.request.method !== 'GET') return;
  
  // 忽略Chrome扩展和其他非同源请求
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有响应，则返回缓存的响应
        if (response) {
          return response;
        }
        
        // 否则，发送网络请求
        return fetch(event.request)
          .then((networkResponse) => {
            // 如果响应有效，则缓存响应
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // 如果网络请求失败，尝试返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// 处理推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '新消息',
    icon: '/favicon/favicon-light-192.png',
    badge: '/favicon/favicon-light-32.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'LMXHL Blog', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});