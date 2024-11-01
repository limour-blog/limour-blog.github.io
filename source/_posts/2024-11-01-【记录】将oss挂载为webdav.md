---
title: 【记录】将OSS挂载为WebDAV
urlname: Mount-OSS-as-a-WebMAV
index_img: https://api.limour.top/randomImg?d=2024-11-01 05:03:45
date: 2024-11-01 13:03:45
tags: oss
---
OSS（对象存储服务）是一种分布式存储服务，它提供了简单的Web服务接口，使得用户可以在任何地方、任何时间存储和检索数据。而WebDAV（基于Web的分布式创作和版本控制）则是一个基于HTTP的协议，它允许用户通过网络对文件进行编辑和管理。将OSS转换成WebDAV可以方便使用Zotero这类文献管理软件进行同步。Zotero支持通过WebDAV协议同步附件，这样用户可以在不同的设备和平台上访问和管理自己的文献资料，提高了工作和研究的效率。因此，使用WebDAV对接OSS可以为Zotero用户带来极大的便利。
## 新建 OSS 桶
+ 新建一个储存桶，记录下`桶名称`
+ 新建一个RAM角色
+ 记录下 `AccessKey ID` 和 `AccessKey Secret`

![](https://img.limour.top/2024/11/01/6724624067144.webp)
![](https://img.limour.top/2024/11/01/672462819133e.webp)

+ 授予访问权限，用 `http` 而非 `https`，因为 `ossfs-webdav` 很老了

![](https://img.limour.top/2024/11/01/672462bd10e86.webp)

+ 记录下`内网 EndPoint`

![](https://img.limour.top/2024/11/01/6724631500a13.webp)

## 转 WebDAV
+ [反向代理服务](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/ossfs && cd ~/app/ossfs && nano docker-compose.yml
sudo docker compose up -d
```
```yml
version: "3"
services:
  ossfs:
    image: xxx.limour.top/yindaheng98/ossfs-webdav
    restart: always
    cap_add:
      - SYS_ADMIN
    devices:
      - /dev/fuse
    security_opt:
      - apparmor=unconfined
    environment:
      SERVER_NAMES: zotero.limour.top
      BucketName: 你的BucketName
      AccessKeyId: 你的AccessKeyId
      AccessKeySecret: 你的AccessKeySecret
      EndPoint: 你的EndPoint
      USERNAME: 你的webdav用户名
      PASSWORD: 你的webdav密码
      OWNER_USER: www-data
      OWNER_GROUP: www-data
 
networks:
  default:
    external: true
    name: ngpm
```
## 配置反代
![](https://img.limour.top/2024/11/01/672463b1b0c91.webp)