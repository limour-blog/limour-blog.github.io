---
title: 【探索】使用Tunnel加速VPS的连接
urlname: Use-Tunnel-to-speed-up-the-connection-of-VPS
date: 2023-10-29 04:36:52
tags: [clash, ss, Tunnel]
hide: true
---
## 准备依赖
+ [自建DoH服务](/Self-built-ad-blocking-DoH-server)
```bash
mkdir -p ~/app/ss && cd ~/app/ss && nano docker-compose.yml
cat > ./config.json <<EOF
{
    "server":"0.0.0.0",
    "server_port":9000,
    "password":"password0",
    "timeout":300,
    "method":"aes-256-gcm",
    "fast_open":false,
    "nameserver":"8.8.8.8",
    "mode":"tcp_and_udp"
}
EOF
```
```yml
version: '3.3'
services:
  ss:
    restart: unless-stopped
    ports:
      - '20077:9000'
      - '20077:9000/udp'
    volumes:
      - './config.json:/etc/shadowsocks-libev/config.json'
      - '/etc/localtime:/etc/localtime:ro'
    image: teddysun/shadowsocks-libev
```
## 配置Tunnel
+ 项目地址: [Github](https://github.com/zzzgydi/clash-verge); [Wiki](https://wiki.metacubex.one/config/); [Android](https://github.com/MetaCubeX/ClashMetaForAndroid)
+ 新建规则-类型选`Local`-编辑文件，内容如下
```yml
mixed-port: 7890
allow-lan: true
bind-address: '*'
mode: rule
log-level: info
external-controller: :9090
dns:
  enable: true
  ipv6: false
  default-nameserver: [223.5.5.5, 119.29.29.29]
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  use-hosts: true
  nameserver: ['https://my.com/token']
proxies:
  - { name: '自建节点', type: ss, server: 127.0.0.1, port: 7777, cipher: aes-256-gcm, password: password0, udp: true }
tunnels:
  - { network: [tcp, udp], address: 127.0.0.1:7777, target: ssip:20077, proxy: "手动选择"}
proxy-providers:
  provider1:
    type: http
    path: ./provider1.yaml
    url: Clash的订阅地址
    interval: 86400
    health-check:
      enable: false
      url: https://www.gstatic.com/generate_204
      interval: 300
  provider2:
    type: http
    path: ./provider2.yaml
    url: Clash的订阅地址
    interval: 86400
    filter: "(?i)AA-中继-HK|AA-中继-JP|AA-V2ray-HK|AA-V2ray-JP"
    exclude-filter: "(?i)海外直连|打機神線"
    health-check:
      enable: false
      url: https://www.gstatic.com/generate_204
      interval: 300
proxy-groups:
  - { name: PROXY, type: select, proxies: ["手动选择", "自建节点", "自动选择", DIRECT] }
  - { name: "手动选择", type: select, use: [provider1, provider2], proxies: ["自动选择"] }
  - { name: "自动选择", type: url-test, use: [provider1, provider2], url: 'https://www.gstatic.com/generate_204', interval: 3600 }
rules:
  - GEOIP,LAN,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```
## 测试加速
+ [DNS测试](https://ipleak.net)
+ [UDP测试](https://browserleaks.com/webrtc)