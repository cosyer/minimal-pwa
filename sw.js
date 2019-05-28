console.log("加载sw脚本");
var cacheStorageKey = "minimal-pwa-8";

var cacheList = ["/", "index.html", "main.css", "e.png", "pwa-fonts.png"];

self.addEventListener("install", function(e) {
  console.log("安装事件，注册后触发只触发一次");
  e.waitUntil(
    caches
      .open(cacheStorageKey)
      .then(function(cache) {
        console.log("加入缓存", cacheList);
        return cache.addAll(cacheList);
      })
      .then(function() {
        console.log("跳过等待");
        return self.skipWaiting();
      })
  );
});

// self.addEventListener("activate", function(e) {
//   console.log("Activate event");
//   e.waitUntil(
//     Promise.all(
//       caches.keys().then(cacheNames => {
//         return cacheNames.map(name => {
//           if (name !== cacheStorageKey) {
//             return caches.delete(name);
//           }
//         });
//       })
//     ).then(() => {
//       console.log("Clients claims.");
//       return self.clients.claim();
//     })
//   );
// });

self.addEventListener("activate", function(e) {
  console.log("激活事件");
  e.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => {
            if (name !== cacheStorageKey) {
              console.log("移除旧缓存", name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        console.log("Clients claims.");
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function(e) {
  console.log("Fetch事件", e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        console.log("读取缓存:", e.request.url);
        return response;
      }
      console.log("无缓存直接请求", e.request.url);
      return fetch(e.request.url);
    })
  );
});
