'use strict';

// 文章实效性提示
hexo.extend.injector.register('body_end', `
  <script defer src="/theme-inject/timeliness.js"></script>
`);

// Umami 统计
hexo.extend.injector.register('head_begin', `
  <script async src="https://analytics.umami.is/script.js" data-website-id="e59ec28a-c9a7-4104-9e62-a9f7eb3fac0b"></script>
`);