const cdn_regex = /.*\/cdn\/(.+?)\//;
const cdn_list = {
	"anchor-js": [
		"https://jscdn.limour.top/npm/anchor-js@4.3.1/",
		"https://cdn.jsdelivr.net/npm/anchor-js@4.3.1/",
		"https://lib.baomitu.com/anchor-js/5.0.0/",
	],
	"github-markdown-css": [
		"https://jscdn.limour.top/npm/github-markdown-css@4.0.0/",
		"https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/",
		"https://lib.baomitu.com/github-markdown-css/4.0.0/",
	],
	"jquery": [
		"https://jscdn.limour.top/npm/jquery@3.6.4/dist/",
		"https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/",
		"https://lib.baomitu.com/jquery/3.6.4/",
	],
	"bootstrap": [
		"https://jscdn.limour.top/npm/bootstrap@4.6.1/dist/",
		"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/",
		"https://lib.baomitu.com/twitter-bootstrap/4.6.1/",
	],
	"tocbot": [
		"https://jscdn.limour.top/npm/tocbot@4.20.1/dist/",
		"https://cdn.jsdelivr.net/npm/tocbot@4.20.1/dist/",
		"https://lib.baomitu.com/tocbot/4.20.1/",
	],
	"nprogress": [
		"https://jscdn.limour.top/npm/nprogress@0.2.0/",
		"https://cdn.jsdelivr.net/npm/nprogress@0.2.0/",
		"https://lib.baomitu.com/nprogress/0.2.0/",
	],
	"katex": [
		"https://jscdn.limour.top/npm/katex@0.16.21/dist/",
		"https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/",
		"https://lib.baomitu.com/KaTeX/0.16.2/",
	],
	"clipboard-js": [
		"https://jscdn.limour.top/npm/clipboard-js@0.3.6/",
		"https://cdn.jsdelivr.net/npm/clipboard-js@0.3.6/",
		"https://lib.baomitu.com/clipboard.js/2.0.11/",
	],
	"hint.css": [
		"https://jscdn.limour.top/npm/hint.css@2.7.0/",
		"https://cdn.jsdelivr.net/npm/hint.css@2.7.0/",
		"https://lib.baomitu.com/hint.css/2.7.0/",
	]
};

var cdn_index = 0;
var flag = 0;
const update_cdn_index = (e) => {
if(flag){return}
flag = 1;
e.waitUntil((async () => {
const cache = await caches.open('freecdn.limour');
const res = await cache.match('cdn_index');
cdn_index = res ? Number(await res.text()) : 0;
})());

async function getFastestUrl(urls) {
	const controllers = new Map();
	const testUrl = (one) => {
		const url = one[0];
		const id = one[1];
		const controller = new AbortController();
		controllers.set(url, controller);
		const startTime = performance.now();
		return fetch(url, { method: 'GET', signal: controller.signal })
			.then(() => {
				return {url, id, time: performance.now() - startTime};
			})
			.catch((error) => {
				return {url, id, time: Infinity};
			});
	};
	const promises = urls.map(testUrl);
	const fastest = await Promise.race(promises);
	controllers.forEach((controller, url) => {if (url !== fastest.url) {controller.abort(); }});
	return fastest;
}
const urls = [
	['https://cdn.jsdelivr.net/npm/anchor-js@4.3.1/anchor.min.js', 1],
	['https://jscdn.limour.top/npm/anchor-js@4.3.1/anchor.min.js', 0],
	['https://lib.baomitu.com/anchor-js/5.0.0/anchor.min.js', 2]
];
getFastestUrl(urls).then((fastest) => {
cdn_index = fastest.id
caches.open('freecdn.limour').then((cache) => {
const res = new Response(cdn_index);
cache.put('cdn_index', res);
console.log('最快的 URL:', fastest);
});
});
};

oninstall = (e) => {
	update_cdn_index(e);
	self.skipWaiting();
};

onactivate = (e) => {
	e.waitUntil(clients.claim());
	update_cdn_index(e);
	console.log(cdn_list, cdn_index);
};

onfetch = (event) => {
	const url = new URL(event.request.url);
if (cdn_regex.test(url.pathname)){
	const key = url.pathname.match(cdn_regex)[1]
	const newUrl = url.href.replace(cdn_regex, cdn_list[key][cdn_index]);
	console.log(newUrl);
	const redirect = Response.redirect(newUrl, 301);
	event.respondWith(redirect);
}}
