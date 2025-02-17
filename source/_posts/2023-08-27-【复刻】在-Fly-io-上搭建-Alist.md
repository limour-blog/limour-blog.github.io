---
title: 【复刻】在 Fly.io 上搭建 Alist
urlname: -fu-ke--zai-Flyio-shang-da-jian-Alist
date: 2023-08-27 20:46:29
index_img: https://api.limour.top/randomImg?d=2023-08-27 20:46:29
tags: alist
excerpt: 在moeyy的教程《使用Fly.io部署Alist》完成后，还有一些优化体验的小细节需要注意。首先，需要获取管理员账号，可以使用命令"flyctl ssh console"来获取。接下来，需要更改静态资源地址，可以使用Cloudflare反代jsDelivr来实现。然后，需要新建一个Worker并替换其中的内容。最后，需要在AList管理页面中将所有的cdn.jsdelivr.net修改为自己反代的地址，并在Vercel上部署Waline来添加评论系统。
---
按 [@moeyy](https://moeyy.xlog.app/) 的教程《[使用 Fly.io 部署 Alist](https://web.archive.org/web/20240826052308/https://moeyy.cn/blog/deploy-alist-on-flyio)》完成后，还有一些优化体验的小细节，在此记录一下。
## 获取管理员账号
```bash
flyctl ssh console # 如果失败，打开所部署的应用页面，刷新后多尝试几次
./alist admin random
```
## 更改静态资源地址
### Cloudflare 反代 jsDelivr
1. 新建一个Worker
```js
// 替换成你想镜像的站点
const upstream = 'cdn.jsdelivr.net'
 
// 如果那个站点有专门的移动适配站点，否则保持和上面一致
const upstream_mobile = 'cdn.jsdelivr.net'
 
const blocked_region = []
 
const blocked_ip_address = ['0.0.0.0', '127.0.0.1']
 
const replace_dict = {
    '$upstream': 'jscdn.limour.top',
    '//cdn.jsdelivr.net': '//jscdn.limour.top'
}
 
//以下内容都不用动
addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
})
 
async function fetchAndApply(request) {
 
    const region = request.headers.get('cf-ipcountry').toUpperCase();
    const ip_address = request.headers.get('cf-connecting-ip');
    const user_agent = request.headers.get('user-agent');
 
    let response = null;
    let url = new URL(request.url);
    let url_host = url.host;
 
    if (url.protocol == 'http:') {
        url.protocol = 'https:'
        response = Response.redirect(url.href);
        return response;
    }
 
    if (await device_status(user_agent)) {
        upstream_domain = upstream
    } else {
        upstream_domain = upstream_mobile
    }
 
    url.host = upstream_domain;
 
    if (blocked_region.includes(region)) {
        response = new Response('Access denied: WorkersProxy is not available in your region yet.', {
            status: 403
        });
    } else if(blocked_ip_address.includes(ip_address)){
        response = new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
            status: 403
        });
    } else{
        let method = request.method;
        let request_headers = request.headers;
        let new_request_headers = new Headers(request_headers);
 
        new_request_headers.set('Host', upstream_domain);
        new_request_headers.set('Referer', url.href);
 
        let original_response = await fetch(url.href, {
            method: method,
            headers: new_request_headers
        })
 
        let original_response_clone = original_response.clone();
        let original_text = null;
        let response_headers = original_response.headers;
        let new_response_headers = new Headers(response_headers);
        let status = original_response.status;
 
        new_response_headers.set('access-control-allow-origin', '*');
        new_response_headers.set('access-control-allow-credentials', true);
        new_response_headers.delete('content-security-policy');
        new_response_headers.delete('content-security-policy-report-only');
        new_response_headers.delete('clear-site-data');
 
        const content_type = new_response_headers.get('content-type');
        if (content_type.includes('text/html') && content_type.includes('UTF-8')) {
            original_text = await replace_response_text(original_response_clone, upstream_domain, url_host);
        } else {
            original_text = original_response_clone.body
        }
 
        response = new Response(original_text, {
            status,
            headers: new_response_headers
        })
    }
    return response;
}
 
async function replace_response_text(response, upstream_domain, host_name) {
    let text = await response.text()
 
    var i, j;
    for (i in replace_dict) {
        j = replace_dict[i]
        if (i == '$upstream') {
            i = upstream_domain
        } else if (i == '$custom_domain') {
            i = host_name
        }
 
        if (j == '$upstream') {
            j = upstream_domain
        } else if (j == '$custom_domain') {
            j = host_name
        }
 
        let re = new RegExp(i, 'g')
        text = text.replace(re, j);
    }
    return text;
}
 
async function device_status (user_agent_info) {
    var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < agents.length; v++) {
        if (user_agent_info.indexOf(agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
```
2. 触发器-路由设置为 `jscdn.limour.top/*`
![](https://img.limour.top/2023/08/30/64ef2038be38d.webp)
### 转换规则设置允许跨域
![](https://img.limour.top/2023/08/30/64ef3b2e23a94.webp)
![](https://img.limour.top/2023/08/30/64ef3b3d28651.webp)
### 替换CDN
在AList 管理页面中，将所有的 `cdn.jsdelivr.net` 修改为自己反代的地址
## 添加评论系统
1. [在 Vercel 上部署 Waline](https://waline.js.org/guide/get-started)
2. AList 管理-设置-全局-自定义头部 中引入 Waline 样式
```html
<link rel="stylesheet" href="https://unpkg.com/@waline/client@v2/dist/waline.css" />
```
![](https://img.limour.top/2023/08/30/64ef3b54db28b.webp)

3. AList 管理-元信息 中引入 Waline 客户端
```html
#  <center> - 评论 Comments -
<div id="waline"></div>
<script type="module">
    import { init } from 'https://unpkg.com/@waline/client@v2/dist/waline.mjs';
    init({
      el: '#waline',
      serverURL: 'https://comments.limour.top',
      pageSize: 3,
    });
</script>
```
![](https://img.limour.top/2023/08/30/64ef3b65d06fb.webp)
### Waline 邮件异步推送
[Waline 邮件异步推送 by 星辰日记](https://blog.xsot.cn/archives/waline-async-mail.html)
+ [搭建反代服务](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/mailpush && cd ~/app/mailpush && nano docker-compose.yml
git clone --depth=1 https://github.com/soxft/waline-async-mail.git
cd waline-async-mail
nano config.example.yaml # 修改成自己的邮件服务
nano templates/guest.html && nano templates/owner.html # 修改成自己的邮件模板
docker build -t xsot/waline-async-mail . && docker image prune
cd ~/app/mailpush
sudo docker-compose up -d
```
```yml
version: "3"
services:
  waline-async-mail:
    image: xsot/waline-async-mail:latest
    volumes:
      - ./waline-async-mail/config.example.yaml:/app/config.yaml
    restart: always
 
networks:
  default:
    external: true
    name: ngpm
```
![注意 "waline-async-mail/" 后面有 "/"](https://img.limour.top/2023/09/23/650effa275900.webp)
+ 在环境变量中添加 `WEBHOOK`, 值为 `https://api.limour.top/mail/limour`
+ 在 Deployments 里，重新部署
+ [WEBHOOK说明](https://waline.js.org/reference/server/env.html#%E9%AB%98%E7%BA%A7%E9%85%8D%E7%BD%AE)

### 附加 Waline 换 MongoDB
1. [MongoDB 官网](https://mongodb.com) 新建免费的 M0 数据库，地区选新加坡，放行 `0.0.0.0/0`
2. [Vercel](https://vercel.com) 上的 Waline 项目，Settings/Functions 里更改 Region 到新加坡
3. MongoDB 连接里记录下连接信息，选项如下
4. 选择 Drivers 作为连接方式，Driver 为 Node.js，Version为 `2.2.12 or later`
5. 进入 Waline 管理后台，导出数据
6. Vercel 里删除 LEAN 相关的环境变量，按 [说明](https://waline.js.org/guide/database.html#mongodb) 添加 MongoDB 的连接信息
7. Vercel/Deployments 里选择合适的分支，点旁边的三个点，选择 Redeploy
8. 进入 Waline 管理后台，重新注册后，导入数据

## 自定义域名
+ DNS 解析只能是<仅 DNS>
+ Domain ownership verification 是 **CNAME**
![](https://img.limour.top/2023/08/30/64ef3b77a0779.webp)

## 版本更新
+ 进 alist 后台 `备份 & 恢复` 进行一次备份以防万一
+ 可能需要验卡: [high-risk-unlock](https://fly.io/high-risk-unlock)
```bash
cd alist-fly
flyctl deploy
```
## 修复 stuck
+ [Machine stuck in replacing state](https://community.fly.io/t/machine-stuck-in-replacing-state/16105)
```bash
cd alist-fly

# 获取 volumes 的可用快照 vs_D2l
fly volumes show
# 恢复快照 得到 vol_r7q
fly volumes create data \
--snapshot-id vs_D2l \
--size 1 \
-a alist-fly-limour

# 获取 stuck 的 machine id 178
fly machine  list
# 另起一台 machine
fly machine clone 178 \
--attach-volume vol_r7q:/opt/alist/data \
--app alist-fly-limour

# 删除 stuck 的 machine
fly machine destroy -f 178 --app alist-fly-limour
# 删除 stuck 的 machine 所用的 volumes
fly volumes destroy vol_zre
```

## 演示地址
+ https://od.limour.top