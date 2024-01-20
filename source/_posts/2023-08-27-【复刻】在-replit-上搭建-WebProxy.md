---
title: 【复刻】在 replit 上搭建 WebProxy
urlname: -fu-ke--zai-replit-shang-da-jian-WebProxy
date: 2023-08-27 20:39:24
index_img: https://api.limour.top/randomImg?d=2023-08-27 20:39:24
tags: ['docker', 'webproxy', 'uptime']
excerpt: moeyy 分享了在replit上搭建WebProxy的方法。首先需要fork项目hideipnetwork-web，然后修改认证。接下来运行并添加自定义域名。然后进行Uptime的部署和安装反代服务。最后是保持Uptime的活动状态。
---
[@moeyy](https://moeyy.xlog.app/) 分享了 Ta 在 [replit](https://replit.com/) 上搭建 [WebProxy](https://xlog.moeyy.cn/ben-zhan-yi-jing-wan-quan-tuo-guan-yu-PaaS-ping-tai-md) 的方法，这里记录一下相关的操作。
## 第一步 FORK 项目
+ 项目是 [hideipnetwork-web](https://github.com/Hideipnetwork/hideipnetwork-web/tree/v3) 已经更新到 V3
+ https://replit.com/@Limour-dev/webproxy
## 第二步 修改认证
![](https://img.limour.top/2023/08/30/64ef39402fc4d.webp)
## 第三步 运行并添加自定义域名
![](https://img.limour.top/2023/08/30/64ef395243443.webp)
## 第四步 部署 Uptime
+ [安装反代服务](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/Uptime && cd ~/app/Uptime && nano docker-compose.yml
sudo docker-compose up -d
```
```yml
version: '3.3'
 
services:
  uptime-kuma:
    image: louislam/uptime-kuma
    volumes:
      - ./uptime-kuma:/app/data
    restart: always
 
networks:
  default:
    external: true
    name: ngpm
```
![](https://img.limour.top/2023/08/30/64ef3965c8a39.webp)
## 第五步 Uptime 保活
![](https://img.limour.top/2023/08/30/64ef397ae6fe0.webp)
