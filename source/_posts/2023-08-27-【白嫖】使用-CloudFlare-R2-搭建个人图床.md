---
title: 【白嫖】使用 CloudFlare R2 搭建个人图床
urlname: -bai-piao--shi-yong-CloudFlare-R2-da-jian-ge-ren-tu-chuang
date: 2023-08-27 20:32:03
tags: ['docker', 'r2', 'lsky']
excerpt: 这篇文章介绍了一个免费的云存储服务，它提供足够的存储空间和请求次数。用户可以自定义域名，并且无需额外配置CDN。文章还提供了创建存储桶、绑定域名、创建S3令牌、安装图床等步骤的详细说明。
---
## 优点介绍
1. [免费额度](https://developers.cloudflare.com/r2/pricing)足够个人使用
2. 无需额外配置 CDN
3. 自定义域名比较优雅

| | Free | Paid - Rates |
| --- | --- | ---|
|存储|	10 GB / month|	$0.015 / GB-month|
|A 类操作|	1 million requests / month|	$4.50 / million requests|
|B 类操作|	10 million requests / month|	$0.36 / million requests|
## 第一步 创建 R2 存储桶
![](https://img.limour.top/2023/08/30/64ef37a2c526d.webp)
## 第二步 绑定域名
![](https://img.limour.top/2023/08/30/64ef37b37d756.webp)
## 第三步 创建 S3 令牌
![](https://img.limour.top/2023/08/30/64ef37c016b9e.webp)
![](https://img.limour.top/2023/08/30/64ef37d2350a2.webp)
## 第四步 安装 lsky 图床
+ [安装反代服务](/Docker-bu-shu-Nginx-Proxy-Manager)
+ [webp 截图](/WEBP-jie-tu-gong-ju-ShareX--imagemagick)
```bash
mkdir -p ~/app/Lsky && cd ~/app/Lsky && nano docker-compose.yml
docker-compose up -d
```
```yml
version: '3.3'
services:
  lsky-pro:
    restart: always
    volumes:
       - './lsky-pro-data:/var/www/html'
    image: 'dko0/lsky-pro'

networks:
  default:
    external: true
    name: ngpm
```
![](https://img.limour.top/2023/08/30/64ef37e438a8d.webp)
## 第五步 图床添加 R2 储存桶
![](https://img.limour.top/2023/08/30/64ef37f072cfd.webp)