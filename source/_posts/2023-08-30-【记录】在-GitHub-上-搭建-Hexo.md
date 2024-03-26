---
title: 【记录】在 GitHub 上 搭建 Hexo
urlname: -ji-lu--zai-GitHub-shang-da-jian-Hexo
date: 2023-08-30 21:07:42
index_img: https://api.limour.top/randomImg?d=2023-08-30 21:07:42
tags: ['Github', 'hexo']
excerpt: 这段文本是关于在安装Hexo博客框架的过程中所需的一些配置和操作。首先需要安装Node环境，然后使用conda命令激活Node环境。接下来使用npm命令安装全局的Hexo命令行工具，并进行版本检查和初始化操作。然后安装hexo-deployer-git插件，并配置相关信息。建立仓库并创建gh-pages分支，修改设置文件，配置GitHub文件加速和获取token。编辑_config.yml文件，配置部署信息和主题。搭建jsDelivr反代服务器并编辑CDN.js文件。最后生成网页并推送到GitHub仓库，进行国内反代加速和备份博客。
---
## 安装 Hexo
+ [安装 node 环境](/-ji-lu--an-zhuang-sheng-xin-de-dai-ma-bian-xie-huan-jing)
```bash
conda activate node
npm i hexo-cli -g
hexo -v
hexo init
npm install
```
## 配置 hexo-deployer-git
1. `npm install hexo-deployer-git --save`
2. `echo hexo.limour.top > source/CNAME`
3.  建立 `<github usrname>.github.io` 的仓库
4.  仓库新建 `gh-pages` 分支
5.  修改 `settings/pages`  中的设置如下
![](https://img.limour.top/2023/08/30/64ef406703939.webp)
1. [搭建 GitHub 文件加速](/-fu-ke-GitHub-wen-jian-jia-su)
2. 按 [hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git) 的指引获取 [token](https://github.com/settings/tokens)
![](https://img.limour.top/2023/08/30/64ef4086383f4.webp)
1. 编辑 `_config.yml`，添加内容如下
```yml
deploy:
  type: git
  repo: https://oauth2:ghp_xxxxx@xxx.limour.top/xxx/https://github.com/limour-blog/limour-blog.github.io.git
  branch: gh-pages
  token: ghp_xxxxx
  name: xxx@limour.top # 注册 Github 的邮箱
  email: xxx@limour.top # 注册 Github 的邮箱
```
## 配置 butterfly 主题
```
npm install hexo-theme-butterfly --save
npm install hexo-renderer-pug hexo-renderer-stylus --save
mkdir scripts && touch scripts/CDN.js
```
+ 编辑 `_config.yml`，修改内容如下
```yml
theme: butterfly
```
+ [搭建 jsDelivr 反代](/-fu-ke--zai-Flyio-shang-da-jian-Alist)
+ 编辑 `scripts/CDN.js`，内容如下
```js
'use strict';
const { filter } = hexo.extend;

// 替换 CDN
filter.register('before_generate', () => {
    const { asset } = hexo.theme.config;
    for (const name in asset) {
        asset[name] = asset[name]
            .replace('//cdn.jsdelivr.net/', '//你自己的反代/');
    }
}, 99);
```
+ [更多文档](https://github.com/jerryc127/hexo-theme-butterfly)
## 生成网页并推送
+ `rm -rf .deploy_git && hexo c &&  hexo g && hexo d`
## 国内反代加速
+ [搭建反代服务器](/Docker-bu-shu-Nginx-Proxy-Manager)
![](https://img.limour.top/2023/08/30/64ef40988fda2.webp)
## 备份博客
+ 编辑 `.gitignore`，添加 `_config.yml`
```bash
git init && git branch -m main
git remote add origin https://oauth2:ghp_xxxxx@xxx.limour.top/xxx/https://github.com/limour-blog/limour-blog.github.io.git
git add . && git commit -m 'backup' && git push -u origin +main
```

## 演示地址
+ https://limour-blog.github.io
+ https://hexo.limour.top

## 附加 Waline 换 MongoDB
1. [MongoDB 官网](https://mongodb.com) 新建免费的 M0 数据库，地区选新加坡，放行 `0.0.0.0/0`
2. [Vercel](https://vercel.com) 上的 Waline 项目，Settings/Functions 里更改 Region 到新加坡
3. MongoDB 连接里记录下连接信息，选项如下
4. 选择 Drivers 作为连接方式，Driver 为 Node.js，Version为 `2.2.12 or later`
5. 进入 Waline 管理后台，导出数据
6. Vercel 里删除 LEAN 相关的环境变量，按 [说明](https://waline.js.org/guide/database.html#mongodb) 添加 MongoDB 的连接信息
7. Vercel/Deployments 里选择合适的分支，点旁边的三个点，选择 Redeploy
8. 进入 Waline 管理后台，重新注册后，导入数据

## 附加 外链转内链
+ 项目地址: [Github](https://github.com/naicfeng/hexo-filter-links); [说明](https://cuojue.org/read/hexo-filter-links.html)
```bash
npm i hexo-filter-links --save
```
+ 去 `_config.yml` 添加配置
```yml
links:
  enable: true
  field: "post"
  exclude:
    - "limour.top"
    - "*.limour.top" #1.0.4及以上版本支持
```

## 附加 部署到本地服务器
```bash
cd ~/base/NGPM/data
git clone --depth=1 -b gh-pages --single-branch https://github.com/limour-blog/limour-blog.github.io.git
```
![NGPM 配置示例](https://img.limour.top/2023/09/16/6505b0cb518fd.webp)
```nginx
location / {
    gzip on;
    gzip_min_length 256;
    gzip_comp_level 6;
    gzip_types text/plain text/xml application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png application/vnd.ms-fontobject font/ttf font/opentype font/x-woff image/svg+xml;
    gzip_vary on;
    gzip_buffers 32 4k;
    root /data/limour-blog.github.io;
    try_files $uri $uri.html $uri/index.html =404;
    error_page 404 /404.html;
}
```
+ 后续更新
```bash
cd ~/base/NGPM/data/limour-blog.github.io
git fetch --depth=1 -f && git reset --hard origin/gh-pages
```
## 附加 添加本地搜索功能
+ [为Hexo博客Yilia主题添加本地站内搜索功能](https://web.archive.org/web/20230328121149/https://gaomf.cn/2016/10/10/为Hexo博客Yilia主题添加本地站内搜索功能/) by [码农半亩地](https://gaomf.cn/index.html)
+ 修改`node_modules/hexo-theme-fluid/scripts/generators/local-search.js`文件
```js
  env.addFilter('noControlChars', function(str) {
    // eslint-disable-next-line no-control-regex
    return str && str.replace(/[\x00-\x1F\x7F]/g, '').replace(/<figure class="highlight.*?<\/figure>/ig, '').replace(/(<([^>]+)>)/ig, '').replace(/(https?:\/\/[^\s]+)/ig, '');
  });
```
```js
  env.addFilter('urlJoin', function(str) {
    const base = str[0];
    const relative = str[1].replace(/\.html$/g, '');
    return relative
      ? base.replace(/\/+$/, '') + '/' + relative.replace(/^\/+/, '')
      : base;
  });
```
## 附加 首选网页
+ 编辑 `scripts/custom.js`, 内容如下
```js
// 首选网页 canonical
hexo.extend.helper.register('autoCanonical', function (config, page) {
  var base_url = config.url;
  if (config.url.charAt(config.url.length - 1) !== '/') base_url += '/';
  base_url += page.canonical_path

  return '<link rel="canonical" href="' + base_url.replace('/index.html', '/').replace(/\.html$/g, '') + '"/>';
});
```
+ 编辑 `node_modules/hexo-theme-fluid/layout/_partials/head.ejs`, 内容如下
```js
// ....
<%- autoCanonical(config, page) %>
</head>
```