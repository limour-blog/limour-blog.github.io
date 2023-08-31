---
title: 【迁移】使用 Gost 搭建 HTTPS 代理
urlname: -shi-yong--Gost--da-jian--HTTPS--dai-li
date: 2023-02-14 21:06:28
tags: ['gost']
---
+ 将提前申请好的ssl证书保存好
+ `mkdir -p ~/app/gost && cd ~/app/gost && nano docker-compose.yml`
+ `sudo docker-compose up -d`+
+ 代理设置为 yourdomain:13443 用户名 limour 密码 passwd
+ 使用SwitchyOmega插件时，每次打开浏览器先访问一下 knock.limour.top 进行认证激活

```yml
version: '3.3'
services:
    gost:
        restart: unless-stopped
        ports:
            - '13443:13443'
        image: ginuerzh/gost
        volumes:
            - ./ssl/fullchain.pem:/bin/cert.pem:ro
            - ./ssl/privkey.key:/bin/key.pem:ro
        command: -L="http+tls://limour:passwd@:13443?cert=cert.pem&key=key.pem&probe_resist=code:400&knock=knock.limour.top"

```