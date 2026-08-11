---
title: 【记录】使用 axonhub 替换 one-api
urlname: replace-one-api-with-axonhub
index_img: https://api.limour.top/randomImg?d=2026-03-01 17:17:48
date: 2026-03-02 01:17:48
tags: openai
excerpt: 无论你使用的是 OpenAI SDK、Anthropic SDK 还是任何 AI SDK，AxonHub 都会透明地将你的请求转换为与任何支持的模型供应商兼容的格式。无需重构，无需更换 SDK——只需更改配置即可。
---
## 部署
+ [反向代理](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/axonhub && cd ~/app/axonhub
```
```bash
cat > docker-compose.yml <<EOF
version: "3"

services:
  axonhub:
    image: looplj/axonhub:latest
    environment:
      AXONHUB_DB_DIALECT: sqlite3
      AXONHUB_DB_DSN: file:/data/axonhub.db?cache=shared&_fk=1
    volumes:
      - ./data:/data
    restart: unless-stopped

networks:
  default:
    external: true
    name: ngpm
EOF
```
```bash
mkdir data && chmod 777 data && sudo docker compose up -d
```

+ 端口映射

![](https://img.limour.top/2026/03/02/69a47a812cb63.webp)

+ 访问地址创建管理员密码完成初始化

#### Nginx Proxy Manager 自定义 Nginx 配置
在 Nginx Proxy Manager 的站点配置中，添加以下自定义 Nginx 配置以启用 CORS：

```nginx
# ===== CORS 允许所有来源 =====
add_header Access-Control-Allow-Origin * always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;
add_header Access-Control-Allow-Headers * always;
add_header Access-Control-Max-Age 86400 always;

# ===== 处理 OPTIONS 预检请求（直接返回 204，不转发到上游）=====
if ($request_method = OPTIONS) {
    return 204;
}
```
## 渠道
+ [Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys?usertype=standard)