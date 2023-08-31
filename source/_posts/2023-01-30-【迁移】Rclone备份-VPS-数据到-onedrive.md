---
title: 【迁移】Rclone备份 VPS 数据到 onedrive
urlname: Rclone-bei-fen-VPS-shu-ju-dao-onedrive
date: 2023-01-30 23:00:16
tags: ['rclone', 'onedrive']
---
## Rclone 挂载 onedrive
+ 下载 [电脑版](https://rclone.org/downloads)，解压，进入目录，左上角文件，打开 PowerShell
+ ./rclone config
+ n
+ onedrive
+ 32 MS OneDrie
+ enter
+ enter
+ 1
+ enter
+ enter
+ 1
+ enter
+ enter
+ 复制下窗口的json
+ enter
+ q
+ 登录服务器
+ mkdir rclone && cd rclone
+ curl https://rclone.org/install.sh | sudo bash
+ rclone config
+ n
+ onedrive
+ 32 MS OneDrie
+ enter
+ enter
+ 1
+ enter
+ n
+ 粘贴token
+ 1
+ enter
+ enter
+ q
## 备份脚本
```bash
#!/bin/bash
tar -zcPf /root/tmp/ngpm_live.tar.gz /root/base/NGPM/letsencrypt/live
# tar -tzvPf /root/tmp/ngpm_live.tar.gz
rclone sync --progress --ignore-errors --transfers=2 \
--exclude='/.*/**' \
--exclude='/.*' \
--exclude='/app/ServerStatus/serverstatus-monthtraffic/**' \
--exclude='/app/WordPress/www/wp-content/cache/**' \
--exclude='/base/NGPM/letsencrypt/live/**' \
--exclude='/base/NGPM/data/logs/**' \
/root od_lk:backup/lk 
```
```bash
nano /root/backup.sh && chmod +x /root/backup.sh
/root/backup.sh
crontab -e
# 30 2 * * 2,4,6 /root/backup.sh
crontab -l
```