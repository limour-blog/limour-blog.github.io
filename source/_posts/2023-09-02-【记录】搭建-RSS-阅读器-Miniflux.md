---
title: 【记录】搭建 RSS 阅读器 Miniflux
urlname: -ji-lu--da-jian-RSS-yue-du-qi-Miniflux
date: 2023-09-02 20:53:18
index_img: https://api.limour.top/randomImg?d=2023-09-02 20:53:18
tags: [docker, ngpm, rss]
excerpt: 基于php的TTRSS速度较慢，因此换成了使用Go编写的RSS阅读器Miniflux，数据库仍然使用Supabase。搭建Miniflux和反代服务器，并开启Fever API。FeedMe的登录方式与TTRSS相同。
---
基于 php 的 TTRSS 虽然好用，但是确实太缓慢了。因此更换使用 Go 写的 RSS 阅读器 Miniflux。
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
      - DATABASE_URL=postgres://miniflux:secret@db/miniflux?sslmode=disable
      - RUN_MIGRATIONS=1
      - POLLING_FREQUENCY=60   #抓取feed的时间间隔（单位为分钟）
      - CREATE_ADMIN=1
      - ADMIN_USERNAME=admin   #管理员帐号用户名
      - ADMIN_PASSWORD=test123   #管理员帐号密码，用户名与密码之后可以在网页中进行修改
    restart: unless-stopped
  db:
    image: postgres:16.2-alpine3.19
    restart: always
    shm_size: 128mb
    environment:
      - POSTGRES_USER=miniflux
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=miniflux
    volumes:
      - ./miniflux-db:/var/lib/postgresql/data
networks:
  default:
    external: true
    name: ngpm
```

![](https://img.limour.top/2023/09/03/64f401cfa6a53.webp)

## 附加 Rss-Translation
+ [Rss-Translation](https://github.com/rcy1314/Rss-Translation) 可以翻译订阅源
+ [自建 RSSHub](/-fu-ke--zai-Koyeb-shang-da-jian-RSSHub)

## 附加 RSS-Translator
+ [Rss-Translator](https://github.com/rss-translator/RSS-Translator) 可以翻译订阅源
```bash
mkdir -p ~/app/RssTranslator && cd ~/app/RssTranslator && nano docker-compose.yml
sudo docker-compose up -d
# 反代 rsstranslator:8000
# 默认账户：admin 密码：rsstranslator
```
```yml
version: '3'
services:
  rsstranslator:
    image: rsstranslator/rsstranslator
    environment:
      - PYTHONUNBUFFERED=0
      - PYTHONDONTWRITEBYTECODE=1
      - DEBUG=0
      - DEMO=0
      - USER_MANAGEMENT=0
      - LOG_LEVEL=ERROR
      - HUEY_WORKERS=10
      - CSRF_TRUSTED_ORIGINS=https://xxx.limour.top
      - default_update_frequency=30
      - default_max_posts=20
    volumes:
      - ./data:/home/rsstranslator/data
    restart: always
    command: bash -c "python manage.py init_server && python manage.py run_huey & uvicorn config.asgi:application --host 0.0.0.0"
 
networks:
  default:
    external: true
    name: ngpm
```
+ [各家api转通用格式](/Aggregating-Azure-and-OpenAI-APIs-with-OneAPI)