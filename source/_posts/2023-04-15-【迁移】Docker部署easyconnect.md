---
title: 【迁移】Docker部署easyconnect
urlname: -Docker-bu-shu-easyconnect
date: 2023-04-15 20:10:52
index_img: https://api.limour.top/randomImg?d=2023-04-15 20:10:52
tags: ['docker', 'easyconnect']
---
深信服开发的非自由的 EasyConnect 代理软件就是依托答辩，想把它运行在 docker 中，并开放 Socks5 供宿主机连接以使用代理，保证不污染环境。使用的项目是 [Hagb/docker-easyconnect](https://github.com/Hagb/docker-easyconnect)
## 服务端
+ [反向代理服务](/Docker-bu-shu-Nginx-Proxy-Manager)
+ 建立目录
```bash
mkdir -p ~/app/easyconnect && cd ~/app/easyconnect
cat > resolv.conf <<EOF
nameserver 127.0.0.63
nameserver 127.0.0.11
EOF
cat > hosts.txt <<EOF
reload 10s
10.108.68.200 zb.fudan.edu.cn
EOF
```
+ 编辑配置 `nano docker-compose.yml`
```yml
version: '3'
services:
  easyconnect:
    image: hagb/docker-easyconnect:7.6.7
    restart: unless-stopped
    devices:
      - /dev/net/tun
    cap_add:
      - NET_ADMIN
    sysctls:
      - net.ipv4.conf.default.route_localnet=1
    environment:
      - EC_VER=7.6.7
      - TZ=Asia/Shanghai
      - DISABLE_PKG_VERSION_XML=1
      - VPN_TUN=tun0
      - PASSWORD=novnc
      - USE_NOVNC=1
      - PING_ADDR=192.168.81.6
      - PING_INTERVAL=90
    volumes:
      - ./root:/root
      - ./resolv.conf:/etc/resolv.conf:ro
 
  gost:
    restart: unless-stopped
    ports:
      - '80:8338'
      - '80:8338/udp'
    image: gogost/gost
    command: -L="ss://chacha20-ietf-poly1305:passwd@:8338" -L="ssu://chacha20-ietf-poly1305:passwd@:8338" -F="socks5://easyconnect:1080"
 
networks:
  default:
    external: true
    name: ngpm
```
+ 运行容器
```bash
docker compose up -d
docker compose logs
```
+ 反代登录地址
![](https://img.limour.top/2024/12/22/67670b5c2a2ba.webp)

## 客户端
+ [Android](https://github.com/shadowsocks/shadowsocks-android/releases)
+ [Windows](https://github.com/shadowsocks/shadowsocks-windows/releases)

## DNS
+ 暂时无法解决
```bash
docker compose exec -it easyconnect \
cat /etc/hosts

docker compose exec -it easyconnect \
cat /usr/share/sangfor/EasyConnect/resources/logs/DNS.log

docker compose exec -it easyconnect \
iptables -t nat -I OUTPUT -p udp ! --sport 7789 -d 127.0.0.63/32 --dport 53 -j DNAT --to-destination 127.0.0.1:5373

docker compose exec -it easyconnect \
busybox nslookup zb.fudan.edu.cn 
```
### 搭建 CoreDNS
+ 需要在内网服务器可以正常解析 dns 的服务器上搭建
```bash
mkdir -p ~/app/coredns && cd ~/app/coredns && mkdir -p ~/app/coredns/coredns

cat > ./coredns/Corefile <<EOF
(snip) {
    log
    errors
    cache
}

. {
    forward . 127.0.0.11
    import snip
}

https://.:53 {
    forward . 127.0.0.11
    import snip
}
EOF

cat > docker-compose.yml <<EOF
version: '3.8'
services:
  coredns:
    image: coredns/coredns:latest
    restart: always
    ports:
      - '2053:53'
      - '2053:53/udp'
    volumes:
      - ./coredns:/etc/coredns/
    command: -conf /etc/coredns/Corefile
EOF

docker compose up -d
docker compose logs
```
### 检查 CoreDNS 
+ 假设 CoreDNS 搭建在内网的 `10.184.107.127:2053` 上
```bash
dig @127.0.0.1 -p 2053 a baidu.com
curl -H 'accept: application/dns-json' --output - \
'http://127.0.0.1:2053/dns-query?dns=uGkBAAABAAAAAAAAB2FsaWJhYmEDY29tAAABAAE&type=A' 
```
### 重配 Gost
+ 修改 Gost 配置
```yml
    command: -L="ss://chacha20-ietf-poly1305:passwd@:8338?dns=10.184.107.127:2053/udp-chain" -L="ssu://chacha20-ietf-poly1305:passwd@:8338" -F="socks5://easyconnect:1080"
```
+ 单独重启 Gost
```bash
docker compose down gost
docker compose up -d gost
```

## 进阶
+ 链式代理：[使用Tunnel加速VPS的连接](./Use-Tunnel-to-speed-up-the-connection-of-VPS)
+ 浏览器插件：[ZeroOmega](https://github.com/zero-peak/ZeroOmega)