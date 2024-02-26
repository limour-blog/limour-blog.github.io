---
title: 【白嫖】使用 CloudFlare R2 搭建个人图床
urlname: -bai-piao--shi-yong-CloudFlare-R2-da-jian-ge-ren-tu-chuang
date: 2023-08-27 20:32:03
index_img: https://api.limour.top/randomImg?d=2023-08-27 20:32:03
tags: ['docker', 'ngpm', 'r2']
excerpt: 这篇文章介绍了一个免费的云存储服务，它提供足够的存储空间和请求次数。用户可以自定义域名，并且无需额外配置CDN。文章还提供了创建存储桶、绑定域名、创建S3令牌、安装图床等步骤的详细说明。
---
## 优点介绍
1. [免费额度](https://developers.cloudflare.com/r2/pricing)足够个人使用
2. 无需额外配置 CDN
3. 自定义域名比较优雅

| | Free | Paid - Rates |
| --- | --- | ---|
|存储|	10 GB / month|	$0.015 / GB-month|
|A 类操作|	1 million requests / month|	$4.50 / million requests|
|B 类操作|	10 million requests / month|	$0.36 / million requests|
## 第一步 创建 R2 存储桶
![](https://img.limour.top/2023/08/30/64ef37a2c526d.webp)
## 第二步 绑定域名
![](https://img.limour.top/2023/08/30/64ef37b37d756.webp)
## 第三步 创建 S3 令牌
![](https://img.limour.top/2023/08/30/64ef37c016b9e.webp)
![](https://img.limour.top/2023/08/30/64ef37d2350a2.webp)
## 第四步 安装 lsky 图床
+ [安装反代服务](/Docker-bu-shu-Nginx-Proxy-Manager)
+ [webp 截图](/WEBP-jie-tu-gong-ju-ShareX--imagemagick)
```bash
mkdir -p ~/app/Lsky && cd ~/app/Lsky && nano docker-compose.yml
docker-compose up -d
```
```yml
version: '3.3'
services:
  lsky-pro:
    restart: always
    volumes:
       - './lsky-pro-data:/var/www/html'
    image: 'dko0/lsky-pro'

networks:
  default:
    external: true
    name: ngpm
```
![](https://img.limour.top/2023/08/30/64ef37e438a8d.webp)
## 第五步 图床添加 R2 储存桶
![](https://img.limour.top/2023/08/30/64ef37f072cfd.webp)
## 附加 图床备份
+ [获取拥有读取和列表权限的令牌](https://developers.cloudflare.com/r2/examples/rclone/)
```bash
sudo -v ; curl https://rclone.org/install.sh | sudo bash -s beta
nano ~/.config/rclone/rclone.conf 
```
```ini
[img]
type = s3
provider = Cloudflare
access_key_id = xxx
secret_access_key = xxxxxx
endpoint = https://<accountid>.r2.cloudflarestorage.com
acl = private
```
```bash
rclone lsd img:limour-img
git clone https://oauth2:ghp_xxx@github.com/limour-blog/img-bed.git
rclone copy --ignore-existing --progress --ignore-errors img:limour-img ~/img-bed
cd ~/img-bed
git add . && git commit -m 'backup' && git push -u origin main
```
## 附加 图片预处理
+ [imagemagick](/WEBP-jie-tu-gong-ju-ShareX--imagemagick)
```powershell
D:\ImageMagick-7.1.1-Q16\magick.exe convert -resize 512x512^ -gravity North -extent 512x512 -quality 50 -define WebP:lossless=false F:\temp\randImg\*.jpg 26.wenbp
# 顶部 -gravity North
# 底部 -gravity South
# 中间 -gravity center
# 右侧 -gravity East
# 左侧 -gravity West
```