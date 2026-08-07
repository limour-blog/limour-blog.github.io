var oldHost = "HEXO.".toLowerCase() + 'ruomil'.split('').reverse().join('') + '.' + "top"
if (window.location.hostname !== oldHost && window.location.hostname !== "localhost" && window.location.hostname !== "limour-blog.github.io") {
  var newUrl = "https://" + oldHost + window.location.pathname + window.location.search + window.location.hash;
  window.location.href = newUrl;
}
