---
title: 【探索】使用Tunnel加速VPS的连接
urlname: Use-Tunnel-to-speed-up-the-connection-of-VPS
date: 2023-10-29 04:36:52
index_img: https://api.limour.top/randomImg?d=2023-10-29 04:36:52
tags: 探索
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
    "method":"chacha20-ietf-poly1305",
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
      - '80:9000'
      - '80:9000/udp'
    volumes:
      - './config.json:/etc/shadowsocks-libev/config.json'
      - '/etc/localtime:/etc/localtime:ro'
    image: teddysun/shadowsocks-libev
```
## 配置Tunnel
+ 项目地址: [Github](https://github.com/clash-verge-rev/clash-verge-rev); [Wiki](https://wiki.metacubex.one/config/); [Android](https://github.com/MetaCubeX/ClashMetaForAndroid)
+ [GitHub 文件加速](/-fu-ke-GitHub-wen-jian-jia-su)
+ 新建规则-类型选`Local`-编辑文件，内容如下
```yml
mixed-port: 7890
allow-lan: true
bind-address: '*'
mode: rule
log-level: info
external-controller: :9090
geodata-mode: true
geox-url:
  geoip: "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat"
  geosite: "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat"
  mmdb: "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb"
geo-auto-update: true
geo-update-interval: 120
profile:
  store-selected: true
  store-fake-ip: true
tcp-concurrent: true
global-client-fingerprint: iOS
dns:
  enable: true
  ipv6: false
  default-nameserver: [223.5.5.5, 119.29.29.29]
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  use-hosts: true
  nameserver: ['https://my.com/token']
  proxy-server-nameserver: [223.5.5.5, 119.29.29.29]
  fallback: ['https://dns.alidns.com/dns-query']
  fallback-filter: { geoip: true, geoip-code: CN, ipcidr: [240.0.0.0/4, 127.0.0.1/8] }
proxies:
  - { name: "链式节点", type: ss, server: cdn.cdn.com, port: 80, cipher: chacha20-ietf-poly1305, password: password0, udp: true, dialer-proxy: "手动选择"}
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
    health-check:
      enable: false
      url: https://www.gstatic.com/generate_204
      interval: 300
proxy-groups:
  - { name: PROXY, type: select, proxies: ["手动选择", "链式节点", DIRECT] }
  - { name: "手动选择", type: select, proxies: ["provider1", "provider2"] }
  - { name: "provider1", type: select, use: [provider1] }
  - { name: "provider2", type: select, use: [provider2] }
rules:
  - GEOSITE,CN,DIRECT
  - GEOSITE,geolocation-!cn,PROXY
  - GEOIP,LAN,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```
## 测试加速
+ [DNS测试](https://ipleak.net)
+ [UDP测试](https://browserleaks.com/webrtc)

## 附加 格式转换
+ [前端](https://acl4ssr-sub.github.io/); [后端](https://github.com/tindy2013/subconverter)
+ 因为 converter 时不时出现RCE漏洞，因此 `/token` 需要保密
```bash
mkdir -p ~/app/converter && cd ~/app/converter && nano docker-compose.yml
sudo docker-compose up -d # 反代地址 converter:25500, 将 /sub 反代到 /token，末尾没有 /
```
```yml
version: '3'
services:
  converter:
    image: tindy2013/subconverter:latest
    restart: always
  
networks:
  default:
    external: true
    name: ngpm
```
## 附加 Warp
+ [获取 warp 配置项](./-ji-lu-Warp-yu-Tor-gong-cun)
+ 访问 `https://www.cloudflare.com/cdn-cgi/trace` 确认是否 `warp=on`
+ 访问 `https://ping0.cc` 确认ip风险
```yml
proxies:
  - { name: 'WARP', type: wireguard, server: engage.cloudflareclient.com, port: 2408, ip: 172.16.0.2, ipv6: ["config"]["interface"]["addresses"]["v6"], private-key: ["private_key"], public-key: ["config"]["peers"]["public_key"], reserved: [0, 0, 0], udp: true, dialer-proxy: "手动选择" }
proxy-groups:
  - { name: PROXY, type: select, proxies: ["手动选择", "链式节点", "WARP", DIRECT] }
```
## 附加 自己写转换
+ 部署 [fastapi-launcher](https://github.com/Limour-dev/fastapi-launcher)
```bash
wget -O app/Plugins/subconverter.py https://raw.githubusercontent.com/Limour-dev/fastapi/refs/heads/main/Plugins/subconverter.py
```