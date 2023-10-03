---
title: 【记录】使用one-api聚合Azure和OpenAI的API
urlname: Aggregating-Azure-and-OpenAI-APIs-with-OneAPI
date: 2023-10-03 20:04:29
tags: ['one-api', 'Azure', 'OpenAI']
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
```bash
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
+ 在 令牌 中新建一个令牌，端点填反代的地址
## 新建渠道
+ Azure 需要确保部署模型的名称是 `gpt-35-turbo`
+ 可以将 one-api 本身当一个渠道进行套娃
+ 在 日志 里可以看到对不同渠道进行了负载均衡

![](https://img.limour.top/2023/10/03/651c07ce6f9d2.webp)