const cdn_regex = /.*\/cdn\/(.+?)\//;
const cdn_list = {
	"anchor-js": [
		"https://jscdn.limour.top/npm/anchor-js@4.3.1/",
		"https://cdn.jsdelivr.net/npm/anchor-js@4.3.1/",
		"https://lib.baomitu.com/anchor-js/5.0.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/anchor-js/5.0.0/"
	],
	"github-markdown-css": [
		"https://jscdn.limour.top/npm/github-markdown-css@4.0.0/",
		"https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/",
		"https://lib.baomitu.com/github-markdown-css/4.0.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/github-markdown-css/4.0.0/"
	],
	"jquery": [
		"https://jscdn.limour.top/npm/jquery@3.6.4/dist/",
		"https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/",
		"https://lib.baomitu.com/jquery/3.6.4/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/jquery/3.6.4/"
	],
	"bootstrap": [
		"https://jscdn.limour.top/npm/bootstrap@4.6.1/dist/",
		"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/",
		"https://lib.baomitu.com/twitter-bootstrap/4.6.1/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/twitter-bootstrap/4.6.1/"
	],
	"tocbot": [
		"https://jscdn.limour.top/npm/tocbot@4.20.1/dist/",
		"https://cdn.jsdelivr.net/npm/tocbot@4.20.1/dist/",
		"https://lib.baomitu.com/tocbot/4.20.1/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/tocbot/4.20.1/"
	],
	"nprogress": [
		"https://jscdn.limour.top/npm/nprogress@0.2.0/",
		"https://cdn.jsdelivr.net/npm/nprogress@0.2.0/",
		"https://lib.baomitu.com/nprogress/0.2.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/nprogress/0.2.0/"
	],
	"katex": [
		"https://jscdn.limour.top/npm/katex@0.16.21/dist/",
		"https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/",
		"https://lib.baomitu.com/KaTeX/0.16.2/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/KaTeX/0.16.2/"
	],
	"clipboard-js": [
		"https://jscdn.limour.top/npm/clipboard-js@0.3.6/",
		"https://cdn.jsdelivr.net/npm/clipboard-js@0.3.6/",
		"https://lib.baomitu.com/clipboard.js/2.0.11/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/clipboard.js/2.0.11/"
	],
	"hint.css": [
		"https://jscdn.limour.top/npm/hint.css@2.7.0/",
		"https://cdn.jsdelivr.net/npm/hint.css@2.7.0/",
		"https://lib.baomitu.com/hint.css/2.7.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/hint.css/2.7.0/"
	],
	"waline": [
		"https://jscdn.limour.top/npm/@waline/client@3.5.2/dist/",
		"https://cdn.jsdelivr.net/npm/@waline/client@3.5.2/dist/",
		"https://registry.npmmirror.com/@waline/client/3.5.2/files/dist/",
		"https://registry.npmmirror.com/@waline/client/3.5.2/files/dist/"
	],
};
const cdn_patch = [
	[/waline.js$/, "waline.umd.js"]
];
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
		['https://jscdn.limour.top/npm/angular@1.8.3/angular-csp.min.css', 0],
		['https://cdn.jsdelivr.net/npm/angular@1.8.3/angular-csp.min.css', 1],
		['https://lib.baomitu.com/angular-i18n/1.8.3/angular-locale_af-na.min.js', 2],
		['https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/angular-i18n/1.8.3/angular-locale_af-na.min.js', 3],
	];
    getFastestUrl(urls).then((fastest) => {
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
	var newUrl = url.href.replace(cdn_regex, cdn_list[key][await cdn_index]);
	for(const [reg, text] of cdn_patch){newUrl = newUrl.replace(reg, text)};
	console.log(newUrl);
	resolve(Response.redirect(newUrl, 301));
}

onfetch = (e) => {
    const url = new URL(e.request.url);
    if (cdn_regex.test(url.pathname)) {
        e.respondWith(new Promise( (resolve) => {
            cdn_redirect(url, resolve)
    }))}
}
