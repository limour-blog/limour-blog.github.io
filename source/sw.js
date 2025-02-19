const cdn_regex = /.*\/cdn\/(.+?)\//;
const cdn_list = {
	"anchor-js": [
		"https://jscdn.limour.top/npm/anchor-js@4.3.1/"
	],
	"github-markdown-css": [
		"https://jscdn.limour.top/npm/github-markdown-css@4.0.0/"
	],
	"jquery": [
		"https://jscdn.limour.top/npm/jquery@3.6.4/dist/"
	],
	"bootstrap": [
		"https://jscdn.limour.top/npm/bootstrap@4.6.1/dist/"
	],
	"tocbot": [
		"https://jscdn.limour.top/npm/tocbot@4.20.1/dist/"
	],
	"nprogress": [
		"https://jscdn.limour.top/npm/nprogress@0.2.0/"
	],
	"katex": [
		"https://jscdn.limour.top/npm/katex@0.16.21/dist/"
	],
	"clipboard-js": [
		"https://jscdn.limour.top/npm/clipboard-js@0.3.6/"
	],
	"hint.css": [
		"https://jscdn.limour.top/npm/hint.css@2.7.0/"
	]
};
oninstall = () => {self.skipWaiting();console.log(self);};
onactivate = (e) => {e.waitUntil(clients.claim());console.log(cdn_list);};
onfetch = (event) => {
    const url = new URL(event.request.url);
if (cdn_regex.test(url.pathname)){
    const key = url.pathname.match(cdn_regex)[1]
    const newUrl = url.href.replace(cdn_regex, cdn_list[key][0]);
    console.log(newUrl);
    const redirect = Response.redirect(newUrl, 301);
    event.respondWith(redirect);
}}
