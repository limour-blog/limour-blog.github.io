---
title: 【记录】部署 Nginx Proxy Manager
urlname: Docker-bu-shu-Nginx-Proxy-Manager
date: 2023-05-11 19:08:03
tags: ['docker', 'ngpm']
---
[Nginx Proxy Manager](https://nginxproxymanager.com/guide)是一个预构建的Docker镜像，可以轻松地将您在家中或其他地方运行的网站转发到外部，并提供免费的SSL证书，无需了解太多关于Nginx或Letsencrypt的知识。在互联网日益普及的今天，使用本项目可以帮助您更加方便地管理和部署网站，同时也提高了您的网站的安全性。无论您是初学者还是有经验的开发人员，本项目都将为您提供便捷的使用体验。
## 搭建环境
+ 安装好 [docker](/DOCKER-an-zhuang-liu-cheng-ji-lu)
## 部署Nginx Proxy Manager
```yaml
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    
networks:
  default:
    external: true
    name: ngpm
```
```bash
sudo docker network create ngpm
mkdir -p ~/base/NGPM && cd ~/base/NGPM && nano docker-compose.yml
sudo docker-compose up -d
# 登录到 http://ip:81
# Email: admin@example.com
# Password: changeme
# 反代 Nginx Proxy Manager
```
## 申请泛域名证书
1. 获取 [cloudflare](https://dash.cloudflare.com/profile/api-tokens) API 令牌
2. API 令牌模板选择【编辑区域 DNS】
3. 记录下 dns_cloudflare_api_token
4. 进入NGPM管理页面，添加证书
![](https://img.limour.top/2023/08/30/64ef2428d820f.webp)
1. 添加证书时选择 DNS验证，填入记录下的dns_cloudflare_api_token
![](https://img.limour.top/2023/08/30/64ef24437ea60.webp)
## 添加基本身份验证
1. 添加 Access List
![](https://img.limour.top/2023/08/30/64ef246139917.webp)
1. 配置账号密码
![](https://img.limour.top/2023/08/30/64ef247e9c0f7.webp)
1. 配置基本身份验证
![](https://img.limour.top/2023/08/30/64ef249365db5.webp)
## 示例：反代 WordPress
```yaml
version: '3.1'
services:
  wordpress:
    image: wordpress
    restart: always
    volumes:
      - ./www:/var/www/html
 
networks:
  default:
    external: true
    name: ngpm
```
```bash
mkdir -p ~/app/WordPress && cd ~/app/WordPress && nano docker-compose.yml
sudo docker-compose up -d
# 反代写法如下 serviceName:port
```
![](https://img.limour.top/2023/08/30/64ef24a8e7f87.webp)
+ 进入 wp-content 目录
+ 下载 [db.php](https://github.com/aaemnnosttv/wp-sqlite-db/blob/master/src/db.php) (来自项目 [wp-sqlite-db](https://github.com/aaemnnosttv/wp-sqlite-db))
+ 重命名 wp-config-sample.php 为 wp-config.php
+ nano ~/app/WordPress/www/wp-config.php
+ 访问 [salt](https://api.wordpress.org/secret-key/1.1/salt) 修改对应的salt
+ 按添加下面的代码，修改数据库位置
+ 访问网站完成安装
```php
define('DB_DIR', '/absolute/custom/path/to/directory/for/sqlite/database/file/');
define('DB_FILE', 'custom_filename_for_sqlite_database');
if(isset($_SERVER['HTTP_X_REAL_IP'])) {
    $list = explode(',',$_SERVER['HTTP_X_REAL_IP']);
    $_SERVER['REMOTE_ADDR'] = $list[0];
    $_SERVER['HTTPS']='on';   
    $_SERVER["SERVER_PORT"] = 443;
    define('WP_HOME', 'https://'.$_SERVER['HTTP_HOST']);
    define('WP_SITEURL', 'https://'.$_SERVER['HTTP_HOST']);
    define('WP_CONTENT_URL', 'https://'.$_SERVER['HTTP_HOST'].'/wp-content');
    define('FORCE_SSL_LOGIN', true);
    define('FORCE_SSL_ADMIN', true);
}
```