---
title: 【迁移】Docker部署easyconnect
urlname: -Docker-bu-shu-easyconnect
date: 2023-04-15 20:10:52
index_img: https://api.limour.top/randomImg?d=2023-04-15 20:10:52
tags: ['docker', 'easyconnect']
---
深信服开发的非自由的 EasyConnect 代理软件就是依托答辩，想把它运行在 docker 中，并开放 Socks5 供宿主机连接以使用代理，保证不污染环境。使用的项目是 [Hagb/docker-easyconnect](https://github.com/Hagb/docker-easyconnect)
```bash
mkdir -p ~/app/easyconnect && cd ~/app/easyconnect && nano docker-compose.yml
ping stuvpn.fudan.edu.cn # 202.120.224.58
sudo docker-compose up -d
sudo docker-compose logs
```
```yml
version: '3'
services:
  easyconnect:
    image: hagb/docker-easyconnect:cli
    restart: unless-stopped
    devices:
      - /dev/net/tun
    cap_add:
      - NET_ADMIN
    environment:
      - EC_VER=7.6.7
      - CLI_OPTS=-d 202.120.224.58:443 -u username -p password
      - TZ=Asia/Shanghai
      - IPTABLES_LEGACY=1
      - DISABLE_PKG_VERSION_XML=1
      - VPN_TUN=tun0
    networks:
      - internal
 
  gost:
    restart: unless-stopped
    ports:
      - '80:8338'
      - '80:8338/udp'
    image: gogost/gost
    command: -L="ss://chacha20-ietf-poly1305:password@:8338" -L="ssu://chacha20-ietf-poly1305:password@:8338" -F="socks5://easyconnect:1080"
    networks:
      - internal
 
networks:
  internal:
    attachable: true
```