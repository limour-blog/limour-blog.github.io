---
title: 【记录】搭建 RSS 阅读器 Miniflux
urlname: -ji-lu--da-jian-RSS-yue-du-qi-Miniflux
date: 2023-09-02 20:53:18
tags: ['rss', 'Miniflux']
excerpt: 基于php的TTRSS速度较慢，因此换成了使用Go编写的RSS阅读器Miniflux，数据库仍然使用Supabase。搭建Miniflux和反代服务器，并开启Fever API。FeedMe的登录方式与TTRSS相同。
---
基于 php 的 TTRSS 虽然好用，但是确实太缓慢了。因此更换使用 Go 写的 RSS 阅读器 Miniflux。数据库依然用 [Supabase](/-ji-lu-TTRSS-shi-yong-Supabase-zuo-shu-ju-ku)。
## 搭建 Miniflux
+ [搭建反代服务器](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/miniflux && cd ~/app/miniflux && nano docker-compose.yml
sudo docker-compose up -d
```
```yml
version: '3'
services:
  miniflux:
    image: miniflux/miniflux:latest
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db.xxx.supabase.co/postgres #数据库url
      - RUN_MIGRATIONS=1
      - POLLING_FREQUENCY=60   #抓取feed的时间间隔（单位为分钟）
      - CREATE_ADMIN=1
      - ADMIN_USERNAME=admin   #管理员帐号用户名
      - ADMIN_PASSWORD=test123   #管理员帐号密码，用户名与密码之后可以在网页中进行修改
    restart: unless-stopped
networks:
  default:
    external: true
    name: ngpm
```
## 开启 Fever API
+ 设置 - 集成 - Fever 里开启
+ FeedMe 登录方式和用  [TTRSS](/-ji-lu-TTRSS-shi-yong-Supabase-zuo-shu-ju-ku) 一样