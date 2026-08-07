const cdn_regex = /.*\/cdn\/(.+?)\//;
const cdn_list = {
	"anchor-js": [
		"https://jscdn.limour.top/npm/anchor-js@5.0.0/",
		"https://cdn.jsdelivr.net/npm/anchor-js@5.0.0/",
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
	"prismjs": [
		"https://jscdn.limour.top/npm/prismjs@1.29.0/",
		"https://cdn.jsdelivr.net/npm/prismjs@1.29.0/",
		"https://lib.baomitu.com/prism/1.29.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/prism/1.29.0/"
	],
	"tocbot": [
		"https://jscdn.limour.top/npm/tocbot@4.20.1/dist/",
		"https://cdn.jsdelivr.net/npm/tocbot@4.20.1/dist/",
		"https://lib.baomitu.com/tocbot/4.20.1/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/tocbot/4.20.1/"
	],
	"typed": [
		"https://lib.baomitu.com/typed.js/2.0.12/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/typed.js/2.0.12/"
	],
	"fancybox": [
		"https://jscdn.limour.top/npm/@fancyapps/fancybox@3.5.7/dist/",
		"https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/",
		"https://lib.baomitu.com/fancybox/3.5.7/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancybox/3.5.7/"
	],
	"nprogress": [
		"https://jscdn.limour.top/npm/nprogress@0.2.0/",
		"https://cdn.jsdelivr.net/npm/nprogress@0.2.0/",
		"https://lib.baomitu.com/nprogress/0.2.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/nprogress/0.2.0/"
	],
	"mathjax": [
		"https://jscdn.limour.top/npm/mathjax@3.2.2/",
		"https://cdn.jsdelivr.net/npm/mathjax@3.2.2/",
		"https://lib.baomitu.com/mathjax/3.2.2/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mathjax/3.2.2/"
	],
	"katex": [
		"https://jscdn.limour.top/npm/katex@0.16.2/dist/",
		"https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/",
		"https://lib.baomitu.com/KaTeX/0.16.2/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/KaTeX/0.16.2/"
	],
	"clipboard-js": [
		"https://jscdn.limour.top/npm/clipboard@2.0.11/dist/",
		"https://cdn.jsdelivr.net/npm/clipboard@2.0.11/dist/",
		"https://lib.baomitu.com/clipboard.js/2.0.11/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/clipboard.js/2.0.11/"
	],
	"mermaid": [
		"https://jscdn.limour.top/npm/mermaid@8.14.0/dist/",
		"https://cdn.jsdelivr.net/npm/mermaid@8.14.0/dist/",
		"https://lib.baomitu.com/mermaid/8.14.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mermaid/8.14.0/"
	],
	"valine": [
		"https://jscdn.limour.top/npm/valine@1.5.1/dist/",
		"https://cdn.jsdelivr.net/npm/valine@1.5.1/dist/",
		"https://lib.baomitu.com/valine/1.5.1/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/valine/1.5.1/"
	],
	"waline": [
		"https://jscdn.limour.top/npm/@waline/client@3.6.0/dist/",
		"https://cdn.jsdelivr.net/npm/@waline/client@3.6.0/dist/",
		"https://lib.baomitu.com/waline/3.6.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/waline/3.6.0/"
	],
	"gitalk": [
		"https://jscdn.limour.top/npm/gitalk@1.8.0/dist/",
		"https://cdn.jsdelivr.net/npm/gitalk@1.8.0/dist/",
		"https://lib.baomitu.com/gitalk/1.8.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/gitalk/1.8.0/"
	],
	"disqusjs": [
		"https://jscdn.limour.top/npm/disqusjs@1.3.0/dist/",
		"https://cdn.jsdelivr.net/npm/disqusjs@1.3.0/dist/",
		"https://lib.baomitu.com/disqusjs/1.3.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/disqusjs/1.3.0/"
	],
	"twikoo": [
		"https://jscdn.limour.top/npm/twikoo@1.6.8/dist/",
		"https://cdn.jsdelivr.net/npm/twikoo@1.6.8/dist/",
		"https://lib.baomitu.com/twikoo/1.6.8/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/twikoo/1.6.8/"
	],
	"discuss": [
		"https://jscdn.limour.top/npm/discuss@1.2.1/dist/",
		"https://cdn.jsdelivr.net/npm/discuss@1.2.1/dist/",
		"https://lib.baomitu.com/discuss/1.2.1/"
	],
	"hint.css": [
		"https://jscdn.limour.top/npm/hint.css@2.7.0/",
		"https://cdn.jsdelivr.net/npm/hint.css@2.7.0/",
		"https://lib.baomitu.com/hint.css/2.7.0/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/hint.css/2.7.0/"
	],
	"moment": [
		"https://jscdn.limour.top/npm/moment@2.29.4/",
		"https://cdn.jsdelivr.net/npm/moment@2.29.4/",
		"https://lib.baomitu.com/moment.js/2.29.4/",
		"https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/moment.js/2.29.4/"
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

async function cdn_redirect(url, request, resolve) {
	const key = url.pathname.match(cdn_regex)[1];
	const list = cdn_list[key];
	if (!list) { resolve(fetch(request)); return; }  // 未知 key 直接走默认请求, 避免挂起
	const newUrl = url.href.replace(cdn_regex, list[await cdn_index] || list[0]);
	console.log(newUrl);
	resolve(Response.redirect(newUrl, 301));
}

onfetch = (e) => {
    const url = new URL(e.request.url);
    if (cdn_regex.test(url.pathname)) {
        e.respondWith(new Promise( (resolve) => {
            cdn_redirect(url, e.request, resolve)
    }))}
}
