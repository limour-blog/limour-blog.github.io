---
title: 【记录】TTRSS 使用 Supabase 做数据库
urlname: -ji-lu-TTRSS-shi-yong-Supabase-zuo-shu-ju-ku
date: 2023-08-28 21:01:23
tags: ['rss', 'supabase', 'docker', 'ngpm']
excerpt: Supabase是一种BaaS平台，提供PostgreSQL数据库。TTRSS是一款基于PHP的免费开源RSS聚合阅读器，可以在服务器上搭建。使用Supabase作为TTRSS的数据库可以减轻服务器的压力，并避免数据丢失。创建数据库时选择离服务器最近的地区，如圣何塞的免费龟壳。记录数据库的连接信息。搭建TTRSS时需要搭建反代服务，并设置账户和密码。使用FeedMe作为安卓端阅读器，并在TTRSS偏好设置中启用API。登录方式选择Fever而不是TTRSS。附加项包括搭建RSSHub和本地部署PostgreSQL数据库。创建新数据库时需要使用相应的命令。
---
[Supabase](https://supabase.com/) 是BaaS 的平台之一，可以提供 PostgresSQL 数据库；[TTRSS](https://github.com/HenryQW/Awesome-TTRSS) 是一款基于 PHP 的免费开源 RSS 聚合阅读器，可以搭建在小鸡上。使用 Supabase 做 TTRSS 的数据库，既能减轻小鸡的压力，也能避免小鸡跑路后数据火葬场。
## 创建数据库
+ 地区选离自己小鸡近的，比如圣何塞的免费龟壳就选美西
![](https://img.limour.top/2023/08/30/64ef3e6315540.webp)
+ 进项目的设置页面，记录下数据库的连接信息
![](https://img.limour.top/2023/08/30/64ef3e744ba6c.webp)
## 搭建 TTRSS
+ [搭建反代服务](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/TTRSS && cd ~/app/TTRSS && nano docker-compose.yml
sudo docker-compose up -d && sudo chmod -R 777 feed-icons
# 默认账户：admin
# 密码：password
```
```yml
version: "3"
services:
  ttrss:
    image: wangqiru/ttrss:latest
    environment:
      - SELF_URL_PATH=https://read.limour.top/ # please change to your own domain
      - DB_HOST=db.xxx.supabase.co
      - DB_PORT=5432
      - DB_NAME=postgres
      - DB_USER=postgres
      - DB_PASS=<设置的密码>
    volumes:
      - ./feed-icons:/var/www/feed-icons/
    stdin_open: true
    tty: true
    restart: always
 
networks:
  default:
    external: true
    name: ngpm
```
![](https://img.limour.top/2023/08/30/64ef3e83eb4bd.webp)
## 使用 FeedMe
[FeedMe](https://github.com/seazon/FeedMe) 是一个用于 RSS 服务的安卓端阅读器。
1. TTRSS 偏好设置里启用API
![](https://img.limour.top/2023/08/30/64ef3e924b904.webp)
1. 登录方式选 `Fever` 而非 `TTRSS`
2. API 端点是 `https://xxx/plugins` 没有 `.local`
![](https://img.limour.top/2023/08/30/64ef3e9d3f321.webp)
1. FeedMe 设置里开启墨水屏优化，查看里设置布局为卡片，效果如下
![](https://img.limour.top/2023/08/30/64ef3eaecfc70.webp)
## 附加项
+ [搭建 RSSHub](/-fu-ke--zai-Koyeb-shang-da-jian-RSSHub)
+ 本地部署 PostgresSQL 数据库
```bash
mkdir -p ~/db/PostgreSQL && cd ~/db/PostgreSQL && nano docker-compose.yml
sudo docker-compose up -d
sudo docker exec -it postgres-db psql
# 使用命令 \q 退出psql
```
```yml
version: '3.3'
services:
  postgres:
    container_name: postgres-db
    environment:
      - TZ=Asia/Shanghai
      - POSTGRES_USER=root
      - POSTGRES_PASSWORD=ROOT_ACCESS_PASSWORD
    volumes:
      - './pgdata:/var/lib/postgresql/data'
    image: postgres
    restart: unless-stopped
 
networks:
  default:
    external: true
    name: ngpm
```
+ 创建新数据库
```sql
# sudo docker exec -it postgres-db psql
create user ttrss with password 'ttrss_passwd'; # 创建用户ttrss
CREATE DATABASE ttrss OWNER ttrss; # 创建用户数据库
GRANT ALL PRIVILEGES ON DATABASE ttrss TO ttrss; # 权限都赋予ttrss
```