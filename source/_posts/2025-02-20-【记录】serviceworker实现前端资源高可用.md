---
title: 【记录】ServiceWorker实现前端资源高可用
urlname: service-worker-resource-high-availability
index_img: https://api.limour.top/randomImg?d=2025-02-20 07:46:29
date: 2025-02-20 15:46:29
tags: hexo
---
JsDelivr 被墙后博客主题换用了国内的CDN，现在想让博客能根据连通性的不同，自动选择最快的 CDN 服务。搜索了一下，有一个 [freecdn](https://github.com/EtherDream/freecdn) 项目，使用 Service Worker 来反代 CDN 链接，但写得太复杂了，小博客只想要个简单的，因此依葫芦画瓢，简单改造了一下主题。
目前博客首次打开时会自动测试最快返回的 CDN，使用其作为默认的 CDN；这也带来了额外的好处，失效的 CDN 会被自动切换到其他可用的 CDN。相比[简单策略让前端资源实现高可用](https://soulteary.com/2019/05/14/simple-policies-make-front-end-resources-highly-available.html)，Service Worker 方案可以透明接入，无需额外修改。
## 引入 sw.js
+ 编辑 HEXO 项目的 `/scripts` 目录，新建 `CDN.js`，内容如下
```js
// freecdn
hexo.extend.injector.register('head_begin', `
<script>
const sw = navigator.serviceWorker;
sw.ready.then(() => {if(!sw.controller){location.reload();}});
sw.register('/sw.js', {scope: '/'});
</script>
`);
```
+ `head_begin` 会将 `<script>` 插入到页面 `<head>` 后的第一行，确保第一时间加载 `sw.js`
+ 注意作用域 `scope`，必须为 `/`，这个不仅代表请求的地址，也代表发出的请求页面
+ `/sw.js` 必须位于 `scope` 的同级目录，不能是子目录；全站需要开启 `https`
## 创建 sw.js
+ 编辑 HEXO 项目的 `/source` 目录，新建 `sw.js`，内容如下
{% fold info @点开查看折叠的代码 %}
```js
const cdn_regex = /.*\/cdn\/(.+?)\//;
const cdn_list = {
	"anchor-js": [
		"https://cdn1/npm/anchor-js@4.3.1/",
		"https://cdn2/npm/anchor-js@4.3.1/",
		"https://lib.baomitu.com/anchor-js/5.0.0/",
	],
	"github-markdown-css": [
		"https://cdn1/npm/github-markdown-css@4.0.0/",
		"https://cdn2/npm/github-markdown-css@4.0.0/",
		"https://lib.baomitu.com/github-markdown-css/4.0.0/",
	],
	"jquery": [
		"https://cdn1/npm/jquery@3.6.4/dist/",
		"https://cdn2/npm/jquery@3.6.4/dist/",
		"https://lib.baomitu.com/jquery/3.6.4/",
	],
	"bootstrap": [
		"https://cdn1/npm/bootstrap@4.6.1/dist/",
		"https://cdn2/npm/bootstrap@4.6.1/dist/",
		"https://lib.baomitu.com/twitter-bootstrap/4.6.1/",
	],
	"tocbot": [
		"https://cdn1/npm/tocbot@4.20.1/dist/",
		"https://cdn2/npm/tocbot@4.20.1/dist/",
		"https://lib.baomitu.com/tocbot/4.20.1/",
	],
	"nprogress": [
		"https://cdn1/npm/nprogress@0.2.0/",
		"https://cdn2/npm/nprogress@0.2.0/",
		"https://lib.baomitu.com/nprogress/0.2.0/",
	],
	"katex": [
		"https://cdn1/npm/katex@0.16.21/dist/",
		"https://cdn2/npm/katex@0.16.21/dist/",
		"https://lib.baomitu.com/KaTeX/0.16.2/",
	],
	"clipboard-js": [
		"https://cdn1/npm/clipboard-js@0.3.6/",
		"https://cdn2/npm/clipboard-js@0.3.6/",
		"https://lib.baomitu.com/clipboard.js/2.0.11/",
	],
	"hint.css": [
		"https://cdn1/npm/hint.css@2.7.0/",
		"https://cdn2/npm/hint.css@2.7.0/",
		"https://lib.baomitu.com/hint.css/2.7.0/",
	]
};
const cdn_index = new Promise((resolve) => {
	async function getFastestUrl(urls) {
		const testUrl = (one) => {
			const url = one[0];
			const id = one[1];
			const startTime = performance.now();
			return fetch(url, {method: 'GET', cache: 'no-cache'})
				.then(() => {
					return {url, id, time: performance.now() - startTime};
				})
				.catch(() => new Promise(() => {}));
		}
		const promises = urls.map(testUrl);
		const fastest = await Promise.race(promises);
		return fastest;
	}
	const urls = [
		['https://cdn2/npm/anchor-js@4.3.1/anchor.min.js', 1],
		['https://cdn1/npm/anchor-js@4.3.1/anchor.min.js', 0],
		['https://lib.baomitu.com/anchor-js/5.0.0/anchor.min.js', 2]
	];
    getFastestUrl(urls).then( (fastest) => {
        caches.open('freecdn.limour').then( (cache) => {
            resolve(fastest.id);
            console.log('最快的 URL:', fastest);
        });
    });
});

oninstall = (e) => {self.skipWaiting();};

onactivate = (e) => {
	e.waitUntil(clients.claim());
	console.log(cdn_list);
};

async function cdn_redirect(url, resolve) {
	const key = url.pathname.match(cdn_regex)[1];
	const newUrl = url.href.replace(cdn_regex, cdn_list[key][await cdn_index]);
	console.log(newUrl);
	resolve(Response.redirect(newUrl, 301));
}

onfetch = (e) => {
    const url = new URL(e.request.url);
    if (cdn_regex.test(url.pathname)) {
        e.respondWith(new Promise( (resolve) => {
            cdn_redirect(url, resolve)
        }
        ))
    }
}
```
{% endfold %}
+ 请将 `cdn1` 和 `cdn2` 替换为合适的 CDN，比如 `fastly.jsdelivr.net` 或 `gcore.jsdelivr.net`
## 修改博客资源地址
+ 修改 `_config.fluid.yml` 中的 `static_prefix`
+ 将资源地址改为 `/cdn/<key>/`
## 更新博客
+ 完成以上操作后，正常生成并部署博客。
## 附加 butterfly 主题
+ 引入 `sw.js` 不变
+ `sw.js` 修改 `cdn_list` 如下
```js
const cdn_list = {
	"custom": [
		"https://s4.zstatic.net/ajax/libs/",
		"https://cdnjs.cloudflare.com/ajax/libs/",
		"https://lib.baomitu.com/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/",
	],
}
```
+ `sw.js` 修改 `urls` 如下
```js
const urls = [
		['https://s4.zstatic.net/ajax/libs/anchor-js/5.0.0/anchor.min.js', 0],
		['https://cdnjs.cloudflare.com/ajax/libs/anchor-js/5.0.0/anchor.min.js', 1],
		['https://lib.baomitu.com/anchor-js/5.0.0/anchor.min.js', 2],
		['https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/anchor-js/5.0.0/anchor.min.js', 3]
	];
```
+ 修改 butterfly 的配置文件
```yml
CDN:
  internal_provider: local
  third_party_provider: custom
  version: false
  custom_format: /cdn/custom/${cdnjs_name}/${version}/${min_cdnjs_file}
```