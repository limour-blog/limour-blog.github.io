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
D:\ImageMagick-7.1.1-Q16\magick.exe convert -resize 512x512^ -gravity North -extent 512x512 -quality 50 -define WebP:lossless=false F:\temp\randImg\*.jpg 26.webp
# 顶部 -gravity North
# 底部 -gravity South
# 中间 -gravity center
# 右侧 -gravity East
# 左侧 -gravity West
```
## 附加 旧图片归档
```bash
mkdir ~/img-bed
apt install imagemagick
convert -version
# 6.9.11
# 将 ~/app/Lsky/lsky-pro-data/storage/app/uploads 目录及其所有的子目录的 png 后缀的图片转换成 webp
# 在保持目录结构不变的前提下，保存到 ~/img-bed 目录下
# 非 png 的文件则直接复制
find ~/app/Lsky/lsky-pro-data/storage/app/uploads -type f -name "*.png" -exec sh -c 'mkdir -p ~/img-bed/$(dirname {}); convert {} -quality 30 -define webp:lossless=false ~/img-bed/$(dirname {})/$(basename {} .png).webp' \;
find ~/app/Lsky/lsky-pro-data/storage/app/uploads -type f ! -name "*.png" -exec sh -c 'mkdir -p ~/img-bed/$(dirname {}); cp {} ~/img-bed/$(dirname {})/$(basename {})' \;
mv ~/img-bed/root/app/Lsky/lsky-pro-data/storage/app/* ~/img-bed & rm -rf ~/img-bed/root & mv ~/img-bed/uploads ~/img-bed/archives_2023
```
+ [获取拥有读写权限的令牌](https://developers.cloudflare.com/r2/examples/rclone/)
```bash
rclone lsd img:limour-img
rclone copy --ignore-existing --progress --ignore-errors ~/img-bed img:limour-img
```
+ 修改原文章图片地址 `_posts` 目录
```bash
sed -i 's|https://img-cdn.limour.top/i/|https://img.limour.top/archives_2023/|g' *.md
sed -i 's|https://img-cdn.limour.top/|https://img.limour.top/archives_2023/|g' *.md
sed -i 's#https://img.limour.top/archives_2023/\(.*\)\.png#https://img.limour.top/archives_2023/\1.webp#g' *.md
```
## 附加 CF优选IP
CF现在会给某些地区的用户固定分配 `104.21.16/32/48/64/80/96/112.1` 这几个IP，以适配特定防火墙。而 R2 的自定义域无法正常更改CNAME，因此得曲线救国一下。
+ 启用R2的 `公共开发 URL`，格式一般为 `pub-xxx.r2.dev`
+ nginx 反代 `pub-xxx.r2.dev`，配置类似下面这样
```nginx
location / {
	proxy_pass https://pub-xxx.r2.dev;
	proxy_ssl_server_name on;
	proxy_ssl_name pub-xxx.r2.dev;
	proxy_set_header Host pub-xxx.r2.dev;
}
```
+ 注意点1 nginx 配置的 Domain Names 为主域名 
+ 注意点2 因CF限制，主域名不能直接 CNAME 到优选域名，需 CNAME 到次域名，次域名再 CNAME 到优选域名
+ 正常按照 [Cloudflare优选IP](https://blog.mnxy.eu.org/posts/tech/cdn) 流程进行即可。