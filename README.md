
Minimal PWA
----

### 准备一个 HTML 文件, 以及相应的 CSS 等:
```html
<head>
  <title>Minimal PWA</title>
  <meta name="viewport" content="width=device-width, user-scalable=no" />
  <link rel="stylesheet" type="text/css" href="main.css">
</head>
<body>
  <h3>Revision 1</h3>
  <div class="main-text">Minimal PWA, open Console for more~~~</div>
</body>
```

### 添加 manifest.json 文件
为了让 PWA 应用被添加到主屏幕, 使用 manifest.json 定义应用的名称, 图标等等信息。
```json
{
  "name": "Minimal app to try PWA",
  "short_name": "Minimal PWA",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#8888ff",
  "background_color": "#aaaaff",
  "icons": [
    {
      "src": "e.png",
      "sizes": "256x256",
      "type": "image/png"
    }
  ]
}
```

### 然后在 HTML 文件当中引入配置:
```html
<link rel="manifest" href="manifest.json" />
```

### 添加 Service Worker
Service Worker 在网页已经关闭的情况下还可以运行, 用来实现页面的缓存和离线, 后台通知等等功能。sw.js 文件需要在 HTML 当中引入:
```js
<script>
  if (navigator.serviceWorker != null) {
    navigator.serviceWorker.register('sw.js')
    .then(function(registration) {
      console.log('Registered events at scope: ', registration.scope);
    });
  }
</script>
```

### 后面我们会往 sw.js 文件当中添加逻辑代码。在 Service Worker 当中会用到一些全局变量:

- self: 表示 Service Worker 作用域, 也是全局变量
- caches: 表示缓存
- skipWaiting: 表示强制当前处在 waiting 状态的脚本进入 activate 状态
- clients: 表示 Service Worker 接管的页面

### 处理静态缓存
首先定义需要缓存的路径, 以及需要缓存的静态文件的列表。
```js
var cacheStorageKey = 'minimal-pwa-1'

var cacheList = [
  '/',
  "index.html",
  "main.css",
  "e.png"
]
// 借助 Service Worker, 可以在注册完成安装 Service Worker 时, 抓取资源写入缓存:

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheStorageKey)
    .then(cache => cache.addAll(cacheList))
    .then(() => self.skipWaiting())
  )
})
// 调用 self.skipWaiting() 方法是为了在页面更新的过程当中, 新的 Service Worker 脚本能立即激活和生效。
```

### 处理动态缓存
网页抓取资源的过程中, 在 Service Worker 可以捕获到 fetch 事件, 可以编写代码决定如何响应资源的请求:
```js
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        return response
      }
      return fetch(e.request.url)
    })
  )
})
```
真实的项目当中, 可以根据资源的类型, 站点的特点, 可以专门设计复杂的策略。fetch 事件当中甚至可以手动生成 Response 返回给页面。

### 更新静态资源

缓存的资源随着版本的更新会过期, 所以会根据缓存的字符串名称(这里变量为 cacheStorageKey, 值用了 "minimal-pwa-1")清除旧缓存, 可以遍历所有的缓存名称逐一判断决决定是否清除。
```js
self.addEventListener('activate', function(e) {
  e.waitUntil(
    Promise.all(
      caches.keys().then(cacheNames => {
        return cacheNames.map(name => {
          if (name !== cacheStorageKey) {
            return caches.delete(name)
          }
        })
      })
    ).then(() => {
      return self.clients.claim()
    })
  )
})
```
在新安装的 Service Worker 中通过调用 self.clients.claim() 取得页面的控制权, 这样之后打开页面都会使用版本更新的缓存。旧的 Service Worker 脚本不再控制着页面之后会被停止。
