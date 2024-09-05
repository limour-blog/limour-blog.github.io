---
title: 【记录】使用one-api聚合Azure和OpenAI的API
urlname: Aggregating-Azure-and-OpenAI-APIs-with-OneAPI
date: 2023-10-03 20:04:29
index_img: https://api.limour.top/randomImg?d=2023-10-03 20:04:29
tags: ['docker', 'ngpm', 'openai', 'llama']
---
[One-api](https://github.com/songquanpeng/one-api) 是 OpenAI 接口管理 & 分发系统，支持Azure、Anthropic Claude、Google PaLM 2、智谱 ChatGLM、百度文心一言、讯飞星火认知、阿里通义千问、360 智脑以及腾讯混元，可用于二次分发管理 key。
+ 在负载均衡的同时，有效避免了key的泄露风险
## 部署 One-api
+ [反向代理](/Docker-bu-shu-Nginx-Proxy-Manager)
+ 账号：`root`
+ 密码：`123456`
```bash
mkdir -p ~/app/one-api && cd ~/app/one-api && nano docker-compose.yml
sudo docker-compose up -d
```
```yml
version: '3'
services:
  one-api:
    image: justsong/one-api:latest
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./data:/data 
    restart: unless-stopped
networks:
  default:
    external: true
    name: ngpm
```
![](https://img.limour.top/2023/10/03/651c068b62241.webp)
## 客户端
+ [ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web)
+ [沉浸式翻译](https://github.com/immersive-translate/immersive-translate)
+ [Jupyter-ai](https://github.com/jupyterlab/jupyter-ai)
+ 在 令牌 中新建一个令牌，端点填反代的地址
## 新建渠道
+ Azure 需要确保部署模型的名称是 `gpt-35-turbo`
+ 可以将 one-api 本身当一个渠道进行套娃
+ 在 日志 里可以看到对不同渠道进行了负载均衡

![](https://img.limour.top/2023/10/03/651c07ce6f9d2.webp)

## 附加 关闭 Azure 筛选
+ 安装[油猴插件](https://greasyfork.org/zh-CN/scripts/489948-azure-openai-modified-filters-隐藏选项开放)
+ 去控制台新建一个筛选器，将筛选关闭，并开启异步筛选注释
+ 设置模型部署中模型的高级选项，切换筛选器为刚刚创建的筛选器

## 附加 Google Vertex
### 注册 GCP 账户
+ 访问 https://cloud.google.com/vertex-ai 并注册GCP账户。
+ 激活账户获得所有模型的访问权限
### 启用 Vertex AI API
+ 访问 https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com 为你的项目启用 Vertex AI API。
+ 访问 https://console.cloud.google.com/vertex-ai/publishers/anthropic/model-garden/claude-3-5-sonnet 申请 Claude 模型。
+ 访问 https://console.cloud.google.com/apis/library/iamcredentials.googleapis.com 激活 IAM Service Account Credentials API
### 创建服务账户
+ 访问 https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts/create?walkthrough_id=iam--create-service-account#step_index=1
+ 选择你之前创建的项目ID。
+ 确保为服务账户授予 `Vertex AI Service Agent`, `Service Account Token Creator` 和 `Vertex AI User` 的角色。
+ 在你刚创建的服务账户页面，转到"密钥"标签，点击"添加密钥"。
+ 选择"创建新密钥"并选择"JSON"作为密钥类型。
+ 密钥文件将自动下载。该文件包含worker所需的变量，如project_id、private_key和client_email。
### 添加到 one-api 渠道
+ 区域 Region 写 `us-east5`
+ Vertex AI Project ID 在 json 文件里
+ Google Cloud Application Default Credentials JSON 为下载的 json 文件的内容
+ [详细内容点此](https://github.com/songquanpeng/one-api/pull/1621)

## 附加 Amazon Bedrock
+ [申请模型访问权限](https://us-west-2.console.aws.amazon.com/bedrock/home)
+ [添加 Access key](https://us-east-1.console.aws.amazon.com/iam/home)
+ [litellm 文档](https://docs.litellm.ai/docs/providers/bedrock)
```bash
mkdir -p ~/app/litellm && cd ~/app/litellm && nano docker-compose.yml
```
```yml
version: "3.9"
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    volumes:
      - ./proxy_server_config.yaml:/app/proxy_server_config.yaml # mount your litellm config.yaml
    environment:
      - AWS_ACCESS_KEY_ID=<ACCESS_KEY>
      - AWS_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY>
      - AWS_REGION_NAME=us-west-2
    restart: unless-stopped
      
networks:
  default:
    external: true
    name: ngpm
```
```bash
wget https://github.com/BerriAI/litellm/raw/main/proxy_server_config.yaml
# 修改 master_key 和 model_list
```
```yml
model_list:
  - model_name: bedrock-claude-haiku
    litellm_params:
      model: bedrock/anthropic.claude-3-haiku-20240307-v1:0
	  
general_settings: 
  master_key: sk-1234
```
```bash
sudo docker-compose up -d
```
+ `one-api` 添加渠道
![](https://img.limour.top/2024/03/20/65fafdb83df04.webp)

## 推荐 部署 SillyTavern
```bash
mkdir -p ~/app/sillytavern && cd ~/app/sillytavern && nano docker-compose.yml
sudo docker-compose up -d
sudo docker-compose logs
nano config/config.yaml 
# listen: true
# whitelist:
#   - 172.*.*.*
sudo docker-compose restart
sudo docker-compose logs
# 反代 sillytavern:8080
# Custom Endpoint (Base URL) 设置 http://one-api:3000/v1
```
```yml
version: "3"
services:
  sillytavern:
    image: ghcr.io/sillytavern/sillytavern:latest
    volumes:
      - "./config:/home/node/app/config"
      - "./user:/home/node/app/public/user"
    restart: unless-stopped
 
networks:
  default:
    external: true
    name: ngpm
```
## 附加 部署 Next-Web
```bash
mkdir -p ~/app/next-web && cd ~/app/next-web && nano docker-compose.yml
sudo docker-compose up -d
```
```yml
version: '3'
services:
  next-web:
    image: yidadaa/chatgpt-next-web:latest
    environment:
      - TZ=Asia/Shanghai
      - BASE_URL=http://one-api:3000/
      - CUSTOM_MODELS=-all,+gpt-3.5-turbo@openai,+gpt-4-turbo@openai,+gpt-4o@openai,+claude-3-haiku@openai,+claude-3.5-sonnet@openai
      - ENABLE_BALANCE_QUERY=1
    restart: unless-stopped
networks:
  default:
    external: true
    name: ngpm
```
![](https://img.limour.top/2023/10/03/651c368465000.webp)
+ [添加基本身份验证](/Docker-bu-shu-Nginx-Proxy-Manager.html#添加基本身份验证)
+ 修改 `/api/openai` 接口的 `header`
```nginx
chunked_transfer_encoding off;
proxy_buffering off;
proxy_cache off;
set $next_header $http_authorization;
if ($http_authorization = "Basic <用户1>"){
set $next_header "Bearer <用户1的key>";
}
if ($http_authorization = "Basic <用户2>"){
set $next_header "Bearer <用户2的key>";
}
proxy_set_header Authorization $next_header;
```
![](https://img.limour.top/2024/03/19/65f94b188381b.webp)
## 附加 搭建独角数卡
+ [反向代理](/Docker-bu-shu-Nginx-Proxy-Manager)
+ 账号：`admin`
+ 密码：`admin`
+ 数据库地址填 `shop-db`
+ Redis地址 填 `shop-redis`
```bash
mkdir -p ~/app/shop && cd ~/app/shop && nano docker-compose.yml && nano env.conf
mkdir storage uploads && chmod -R 777 ./* && sudo docker-compose up -d
# 访问首页完成安装后
sudo docker-compose down
# 分别把 - INSTALL=true 改成 - INSTALL=false
# 把 APP_DEBUG=true 改成 APP_DEBUG=false
# 把 ADMIN_HTTPS=false 改成 ADMIN_HTTPS=true
sudo docker-compose up -d
```
```yml
version: "3"
 
services:
  shop:
    image: ghcr.io/apocalypsor/dujiaoka:latest
    environment:
      - TZ=Asia/Shanghai
      # - INSTALL=false
      - INSTALL=true
      # - MODIFY=true
      - ADMIN_HTTPS=true
    volumes:
      - ./env.conf:/dujiaoka/.env
      - ./uploads:/dujiaoka/public/uploads
      - ./storage:/dujiaoka/storage
    restart: always
 
  shop-db:
    image: mariadb:focal
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=changeyourpassword
      - MYSQL_DATABASE=dujiaoka
      - MYSQL_USER=dujiaoka
      - MYSQL_PASSWORD=changeyourpassword
    volumes:
      - ./mysql:/var/lib/mysql
 
  shop-redis:
    image: redis:alpine
    restart: always
    volumes:
      - ./redis:/data
 
networks:
  default:
    external: true
    name: ngpm
```
```conf
APP_NAME=璃墨的小卖部
APP_ENV=local
APP_KEY=base64:rKwRuI6eRpCw/9e2XZKKGj/Yx3iZy5e7+FQ6+aQl8Zg=
APP_DEBUG=true
APP_URL=https://shop.limour.top

LOG_CHANNEL=stack

# 数据库配置
DB_CONNECTION=mysql
DB_HOST=shop-db
DB_PORT=3306
DB_DATABASE=dujiaoka
DB_USERNAME=dujiaoka
DB_PASSWORD=changeyourpassword

# redis配置
REDIS_HOST=shop-redis
REDIS_PASSWORD=
REDIS_PORT=6379

BROADCAST_DRIVER=log
SESSION_DRIVER=file
SESSION_LIFETIME=120

# 缓存配置
# file为磁盘文件  redis为内存级别
# redis为内存需要安装好redis服务端并配置
CACHE_DRIVER=redis

# 异步消息队列
# sync为同步  redis为异步
# 使用redis异步需要安装好redis服务端并配置
QUEUE_CONNECTION=redis

# 后台语言
## zh_CN 简体中文
## zh_TW 繁体中文
## en    英文
DUJIAO_ADMIN_LANGUAGE=zh_CN

# 后台登录地址
ADMIN_ROUTE_PREFIX=/admin

# 是否开启https (前端开启了后端也必须为true)
# 后台登录出现0err或者其他登录异常问题，大概率是开启了https而后台没有开启，把下面的false改为true即可
ADMIN_HTTPS=true
```
![](https://img.limour.top/2023/10/05/651d95446340c.webp)