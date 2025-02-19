var oldHost = "HEXO.".toLowerCase() + 'ruomil'.split('').reverse().join('') + '.' + "top"
if (window.location.hostname !== oldHost && window.location.hostname !== "localhost" && window.location.hostname !== "limour-blog.github.io") {
  var newUrl = "https://" + oldHost + window.location.pathname + window.location.search + window.location.hash;
  window.location.href = newUrl;
}
if (window.location.hostname !== oldHost){
  for(const each of document.querySelectorAll('script')){
    console.log(each.src);
    if(each.src.includes('jscdn.limour.top')){
      var script = document.createElement('script');
      script.src = each.src.replace('jscdn.limour.top', 'cdn.jsdelivr.net');
      each.remove();
      document.head.appendChild(script);
    }
  }
}