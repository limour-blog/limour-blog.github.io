'use strict';

// 文章实效性提示
hexo.extend.injector.register('body_end', `
  <script defer src="/theme-inject/timeliness.js"></script>
`);

// shynet 统计
hexo.extend.injector.register('head_begin', `
<script defer src="https://api.limour.top/vue/0d2f95c1-755d-436b-adf8-eee12a80ed32/script.js"></script>
`);

// 首选网页 canonical
hexo.extend.helper.register('autoCanonical', function (config, page) {
  var base_url = config.url;
  if (config.url.charAt(config.url.length - 1) !== '/') base_url += '/';
  base_url += page.canonical_path

  return '<link rel="canonical" href="' + base_url.replace('/index.html', '/').replace(/\.html$/g, '') + '"/>';
});