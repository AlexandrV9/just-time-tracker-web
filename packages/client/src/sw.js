// import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

// precacheAndRoute(self.__WB_MANIFEST)

// cleanupOutdatedCaches()

// Версия кэша - меняем при обновлении приложения
const CACHE_NAME = 'notes-app-v1.0.0';

// Статические ресурсы для кэширования при установке
const STATIC_CACHE_URLS = [
  '/',
  "https://fonts.googleapis.com/",
  // "/icons",
  // '/manifest.json',
  // '/favicon.ico',
  // Добавьте другие важные статические файлы
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker: Installing...');
  
  // Пропускаем ожидание - активируем сразу
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets', cache);
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation completed');
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('🎉 Service Worker: Activated');
  
  event.waitUntil(
    // Очищаем старые кэши
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Берём управление всеми клиентами
      return self.clients.claim();
    })
    .then(() => {
      console.log('✅ Service Worker: Ready to handle requests');
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Пропускаем не-GET запросы и chrome-extension
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    // Стратегия: Network First для API, Cache First для статики
    handleFetch(request)
      .catch(() => {
        // Fallback для оффлайн режима
        return createOfflineResponse(request);
      })
  );
});

// Стратегия обработки запросов
async function handleFetch(request) {
  // Для API запросов: Network First
  if (request.url.includes('/api/')) {
    return networkFirstStrategy(request);
  }
  
  // Для статики: Cache First
  return cacheFirstStrategy(request);
}

// Стратегия Network First (для API)
async function networkFirstStrategy(request) {
  try {
    // Пытаемся получить свежие данные из сети
    const networkResponse = await fetch(request);
    
    // Кэшируем успешные ответы
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Если сеть недоступна, пробуем кэш
    console.log('🌐 Network failed, trying cache...', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Стратегия Cache First (для статики)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Если в кэше нет, загружаем из сети
  const networkResponse = await fetch(request);
  
  // Кэшируем для будущего использования
  if (networkResponse.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Создаем оффлайн-ответ для навигационных запросов
function createOfflineResponse(request) {
  // Если это навигационный запрос (HTML), показываем оффлайн страницу
  if (request.mode === 'navigate') {
    return caches.match('/')
      .then((cachedIndex) => {
        return cachedIndex || new Response('Offline', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      });
  }
  
  // Для других запросов возвращаем ошибку
  return new Response('Network error', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Фоновая синхронизация
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'background-sync') {
//     console.log('🔄 Service Worker: Background sync triggered');
//     event.waitUntil(syncPendingData());
//   }
// });

// Периодическая синхронизация (если поддерживается)
// self.addEventListener('periodicsync', (event) => {
//   if (event.tag === 'periodic-sync') {
//     console.log('🔄 Service Worker: Periodic sync triggered');
//     event.waitUntil(syncPendingData());
//   }
// });

// Функция синхронизации данных
// async function syncPendingData() {
//   // Здесь будет логика синхронизации с сервером
//   console.log('🔄 Syncing data with server...');
  
//   try {
//     // TODO: Реализовать синхронизацию
//     const result = await syncWithServer();
//     console.log('✅ Sync completed:', result);
//   } catch (error) {
//     console.error('❌ Sync failed:', error);
//   }
// }

// async function syncWithServer() {
//   // Заглушка - будет реализована позже
//   return Promise.resolve('Sync not implemented yet');
// }

// // Push уведомления
// self.addEventListener('push', (event) => {
//   if (!event.data) return;
  
//   const data = event.data.json();
//   const options = {
//     body: data.body || 'New notification',
//     icon: '/icon-192.png',
//     badge: '/icon-192.png',
//     vibrate: [100, 50, 100],
//     data: {
//       url: data.url || '/'
//     }
//   };
  
//   event.waitUntil(
//     self.registration.showNotification(data.title || 'Notes App', options)
//   );
// });

// // Клик по уведомлению
// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
  
//   event.waitUntil(
//     clients.matchAll({ type: 'window' }).then((clientList) => {
//       // Ищем открытое окно приложения
//       for (const client of clientList) {
//         if (client.url === '/' && 'focus' in client) {
//           return client.focus();
//         }
//       }
      
//       // Если приложение не открыто, открываем новое окно
//       if (clients.openWindow) {
//         return clients.openWindow(event.notification.data.url);
//       }
//     })
//   );
// });