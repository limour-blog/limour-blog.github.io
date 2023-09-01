---
title: 【迁移】树莓派：Rclone+aria2做Onedrive离线下载机
urlname: Rclone-aria2-zuo-Onedrive-li-xian-xia-zai-ji
date: 2022-07-13 17:12:52
tags: ['raspberrypi', 'rclone', 'aria2']
---

[Rclone使用自建应用挂上了Ondrive](/Rclone-bei-fen-VPS-shu-ju-dao-onedrive)，接下来就该配置aria2+自动上传脚本了。

## 安装aira2

```yml
version: "3.8"
services:
  Aria2-Pro:
    container_name: aria2-pro
    image: p3terx/aria2-pro
    environment:
      - PUID=$UID
      - PGID=$GID
      - UMASK_SET=000
      - RPC_SECRET=******
      - RPC_PORT=16800
      - LISTEN_PORT=51413
      - DISK_CACHE=64M
      - IPV6_MODE=true # 需要网络完整支持 IPv6 ，否则会导致部分功能异常，甚至无法下载
      - UPDATE_TRACKERS=true
      - TZ=Asia/Shanghai
      - SPECIAL_MODE=rclone
    volumes:
      - ./aria2-config:/config
      - /home/share/aria2:/downloads
# If you use host network mode, then no port mapping is required.
# This is the easiest way to use IPv6 networks.
    network_mode: host
#    network_mode: bridge
#    ports:
#      - 6800:6800
#      - 6888:6888
#      - 6888:6888/udp
    restart: unless-stopped
# Since Aria2 will continue to generate logs, limit the log size to 1M to prevent your hard disk from running out of space.
    logging:
      driver: json-file
      options:
        max-size: 1m
```

*   路由器配置端口映射，51413映射到树莓派的51413，tcp+udp
*   mkdir aira2 && cd aira2
*   nano docker-compose.yml
*   sudo -i
*   cd /home/pi/aira2
*   docker-compose up -
*   d
*   docker-compose logs
*   cp ~/.config/rclone/rclone.conf ./aria2-config/
*   查看rclone是否成功配置 docker exec -it aria2-pro rclone config 顺便记下网盘名称
*   反代16800端口到AriaNG反代的location的/jsonrpc上

## 配置自动上传脚本

*   根据实际情况修改 ./aria2-config/ 配置文件目录下`script.conf`文件中的网盘名称(`drive-name`)和网盘路径(`drive-dir`)这两个选项的值；注意网盘路径前有注释，配置时需去掉#
*   到 [七米蓝的仓库](https://al.chirmyram.com/) 找一份文件进行下载测试

参考1：[p3terx](https://p3terx.com/archives/offline-download-of-onedrive-gdrive.html)  
参考2：[p3terx](https://p3terx.com/archives/docker-aria2-pro.html)  
参考3：[咕咕鸽](https://blog.laoda.de/archives/aria2-rclone-filebrowser)