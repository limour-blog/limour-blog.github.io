---
title: 【转载】Docker搭建MicroBin
urlname: Docker-da-jian-MicroBin
date: 2023-01-13 23:05:18
tags: ['docker', 'ngpm']
---
```bash
mkdir -p ~/app/MicroBin && cd ~/app/MicroBin && nano docker-compose.yml
sudo docker-compose up -d
```
```yml
version: '3.5'
 
services:
  microbin:
    image: danielszabo99/microbin:latest
    container_name: microbin
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
      - MICROBIN_HIGHLIGHTSYNTAX=true
      - MICROBIN_HASH_IDS=true
      - MICROBIN_EDITABLE=false
      - MICROBIN_PRIVATE=false
      - MICROBIN_HIDE_FOOTER=true
      - MICROBIN_HELP=true
      - MICROBIN_HIDE_HEADER=true
      - MICROBIN_HIDE_LOGO=true
      - MICROBIN_NO_ETERNAL_PASTA=false
      - MICROBIN_NO_FILE_UPLOAD=true
      - MICROBIN_NO_LISTING=true
      - MICROBIN_THREADS=1
      - MICROBIN_TITLE=free-bin
      - MICROBIN_PUBLIC_PATH=https://paste.limour.top/    # 记得改成自己的网址
      - MICROBIN_QR=true
    ports:
      - 18083:8080    # 冒号左边可以改成自己需要的端口号
    volumes:
      - ./microbin-data:/app/pasta_data     # 冒号左边可以改自己想要的挂载路径
```