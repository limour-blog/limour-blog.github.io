---
title: 【复刻】在 Koyeb 上搭建 RSSHub
urlname: -fu-ke--zai-Koyeb-shang-da-jian-RSSHub
date: 2023-08-28 20:54:22
tags: rss
excerpt: 验证信用卡后，Koyeb每月提供$5.5的免费额度，可以部署两个nano服务。新建一个项目，填写镜像为docker.io/diygod/rsshub，标签为chromium-bundled。配置环境变量，选择Web服务类型，将端口改为1200。添加以下环境变量：NODE_ENV为production，CACHE_TYPE为memory，MEMORY_MAX为64，ACCESS_KEY为自定义的访问密钥，HTTP_BASIC_AUTH_NAME为limour，HTTP_BASIC_AUTH_PASS为自定义的HTTP密码。自定义域名，添加完DNS的CNAME后等待一段时间。更新项目，点击Redeploy即可。使用方式有两种认证方式：方式1为使用自定义的访问密钥，链接为https://rss.limour.top/foreverblog/feeds?key=自定义ACCESS密钥；方式2为使用自定义的HTTP密码，链接为https://limour:自定义HTTP密码@rss.limour.top/foreverblog/feeds。
---
验证信用卡后，Koyeb 每月提供 $5.5 的免费额度，可以部署两个 nano services。
## 新建一个项目
![](https://img.limour.top/2023/08/30/64ef3cbe14b8e.webp)
+ Image 填 `docker.io/diygod/rsshub`
+ Tag 填 `chromium-bundled`
## 配置环境变量
![](https://img.limour.top/2023/08/30/64ef3cd524a2a.webp)
+ service type 选 Web
+ Port 改成 `1200`
+ 添加以下环境变量
```env
NODE_ENV: production
CACHE_TYPE: memory
MEMORY_MAX: 64
ACCESS_KEY: 自定义ACCESS密钥
HTTP_BASIC_AUTH_NAME: limour
HTTP_BASIC_AUTH_PASS: 自定义HTTP密码
```
## 自定义域名
![](https://img.limour.top/2023/08/30/64ef3ce4286f4.webp)
+ 添加完 DNS 的 CNAME 后等一会儿
## 更新项目
![](https://img.limour.top/2023/08/30/64ef3cf521814.webp)
+ 点这个 `Redeploy` 就行
## 使用方式
+ 认证方式1：`https://rss.limour.top/foreverblog/feeds?key=自定义ACCESS密钥`
+ 认证方式2：`https://limour:自定义HTTP密码@rss.limour.top/foreverblog/feeds`