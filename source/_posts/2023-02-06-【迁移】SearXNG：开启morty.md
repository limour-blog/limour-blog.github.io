---
title: 【迁移】SearXNG：开启morty
urlname: SearXNG-kai-qi-morty
date: 2023-02-06 22:46:12
index_img: https://api.limour.top/randomImg?d=2023-02-06 22:46:12
tags: ['searxng', 'morty']
---
## 部署 SearXNG
```bash
mkdir -p ~/app/SearXNG && cd ~/app/SearXNG && nano docker-compose.yml
sudo docker-compose up -d
sudo docker-compose logs
# NPM面板反代8180端口，并设置域名解析。
sudo docker-compose down
sed -i "s|ultrasecretkey|$(openssl rand -hex 32)|g" searxng/settings.yml # 生成一个密钥
sudo nano searxng/settings.yml
# 将redis项下的 url: false 改为 url: redis://redis:6379/0
sudo docker-compose up -d
```
```yml
version: '3.7'
services:
  redis:
    container_name: redis_searxng
    image: "redis:alpine"
    command: redis-server --save "" --appendonly "no"
    networks:
      - searxng
    tmpfs:
      - /var/lib/redis
    cap_drop:
      - ALL
    cap_add:
      - SETGID
      - SETUID
      - DAC_OVERRIDE
 
  searxng:
    container_name: searxng
    image: searxng/searxng:latest
    networks:
      - searxng
    ports:
      - "8180:8080"   # 这个冒号左边的端口可以更改，右边的不要改
    volumes:
      - ./searxng:/etc/searxng:rw
    environment:
      - SEARXNG_HOSTNAME=s.limour.top
      - SEARXNG_BASE_URL=https://s.limour.top/
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
      - DAC_OVERRIDE
    logging:
      driver: "json-file"
      options:
        max-size: "1m"
        max-file: "1"
networks:
  searxng:
    ipam:
      driver: default
```
## 部署 morty
```bash
mkdir -p ~/app/morty && cd ~/app/morty && nano docker-compose.yml
sudo docker-compose up -d
# 反代3000端口
# 为了安全，建议开启认证
```
```yml
version: '3.3'
services:
    morty:
        environment:
            - DEBUG=false
            - 'MORTY_ADDRESS=0.0.0.0:3000'
        image: dalf/morty
        restart: always
        ports:
            - '3000:3000'
        command: -timeout 60 -ipv6=false
```