'use strict';
const { filter } = hexo.extend;

// 替换 CDN
filter.register('before_generate', () => {
    const { asset } = hexo.theme.config;
    for (const name in asset) {
        asset[name] = asset[name]
            .replace('//cdn.jsdelivr.net/', '//jscdn.limour.top/');
    }
}, 99);

// freecdn
hexo.extend.injector.register('head_begin', `
<script src="/theme-inject/cdn.js"></script>
`);
