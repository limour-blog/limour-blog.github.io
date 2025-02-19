var oldHost = "HEXO.".toLowerCase() + 'ruomil'.split('').reverse().join('') + '.' + "top"
if (window.location.hostname !== oldHost && window.location.hostname !== "localhost" && window.location.hostname !== "limour-blog.github.io") {
  var newUrl = "https://" + oldHost + window.location.pathname + window.location.search + window.location.hash;
  window.location.href = newUrl;
}

if ('serviceWorker' in navigator) {
const sw = navigator.serviceWorker
sw.ready.then(() => {
  console.log('reload');
  if(!navigator.serviceWorker.controller){location.reload();}
});
sw.register('/sw.js', {scope: '/'})
.then(registration => {
  console.log('Service Worker registered:', registration);
});
}
