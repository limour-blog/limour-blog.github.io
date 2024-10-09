---
title: 【记录】搭建端到端加密的Enclosed和局域网传输数据的SnapDrop
urlname: Building-an-end-to-end-encrypted-enclosure-and-SnapDrop-for-LAN-data-transmission
index_img: https://api.limour.top/randomImg?d=2024-10-09 06:19:19
date: 2024-10-09 14:19:19
tags: ['docker', 'ngpm']
---
Enclosed，一个极简的网络应用程序，旨在发送私人和安全的消息。所有消息都是端到端加密的，确保服务器和存储对内容没有任何了解。用户可以设置密码，定义过期时间（TTL），并选择在阅读后让消息自毁。

Snapdrop，一个开源的在线文件传输工具，可以在 Windows、Mac、Linux、iOS、Android 任何平台使用，只要我们的设备有浏览器就能用他来传输文件。

## 搭建 Enclosed
+ [反向代理服务](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/enclosed && cd ~/app/enclosed && touch .env && nano docker-compose.yml
sudo docker compose up -d
```
```yml
version: '3.6'
 
services:
  enclosed:
    image: docker.limour.top/corentinth/enclosed:latest
    restart: always
    env_file:
      - .env
    volumes:
      - ./enclosed-data:/app/.data
      - /etc/localtime:/etc/localtime:ro
 
networks:
  default:
    external: true
    name: ngpm
```

![](https://img.limour.top/2024/10/09/67062314c51e1.webp)

## 搭建 SnapDrop
```bash
mkdir -p ~/app/snapdrop && cd ~/app/snapdrop && touch .env && nano docker-compose.yml
sudo docker compose up -d
```
```yml
version: '3.6'
 
services:
  snapdrop:
    image: docker.limour.top/linuxserver/snapdrop:latest
    restart: always
    env_file:
      - .env
    volumes:
      - /etc/localtime:/etc/localtime:ro
 
networks:
  default:
    external: true
    name: ngpm
```

![](https://img.limour.top/2024/10/09/67062351e1a9e.webp)