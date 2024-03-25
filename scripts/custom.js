'use strict';

// 文章实效性提示
hexo.extend.injector.register('body_end', `
  <script defer src="/theme-inject/timeliness.js"></script>
`);

// shynet 统计
hexo.extend.injector.register('head_begin', `
<script defer src="https://api.limour.top/vue/0d2f95c1-755d-436b-adf8-eee12a80ed32/script.js"></script>
`);