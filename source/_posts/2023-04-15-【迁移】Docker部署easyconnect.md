---
title: 【迁移】Docker部署easyconnect
urlname: -Docker-bu-shu-easyconnect
date: 2023-04-15 20:10:52
index_img: https://api.limour.top/randomImg?d=2023-04-15 20:10:52
tags: ['docker', 'easyconnect']
---
深信服开发的非自由的 EasyConnect 代理软件就是依托答辩，想把它运行在 docker 中，并开放 Socks5 供宿主机连接以使用代理，保证不污染环境。使用的项目是 [Hagb/docker-easyconnect](https://github.com/Hagb/docker-easyconnect)
## 一、搭建服务端
+ [反向代理服务](/Docker-bu-shu-Nginx-Proxy-Manager)

```bash
mkdir -p ~/app/easyconnect && cd ~/app/easyconnect && \
cat > resolv.conf <<EOF
nameserver 127.0.0.1
nameserver 127.0.0.11
EOF

# 查看系统的特殊 DNS, 比如阿里云内网解析的 DNS
cat /etc/resolv.conf

# 分流 内网 DNS 解析
cat > fd.list <<EOF
cnki.net
edu.cn
EOF

# 下面的 10.184.107.127 与 《三、解决内网 DNS》 有关
cat > smartdns.conf <<EOF
bind [::]:53 -no-speed-check
bind-tcp [::]:53 -no-speed-check
response-mode fastest-response
force-AAAA-SOA yes
server 127.0.0.11 -bootstrap-dns
proxy-server socks5://easyconnect:1080 -name socks5
nameserver 223.5.5.5
server-tcp 10.184.107.127:2053 -group fddns -proxy socks5 -exclude-default-group
domain-set -name fdsite -file /etc/smartdns/fd.list
domain-rules /domain-set:fdsite/ -nameserver fddns
EOF

cat > docker-compose.yml <<EOF
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
    extra_hosts:
      - 'host.docker.internal:host-gateway'
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
 
  smartdns:
    restart: unless-stopped
    ports:
      - '53:53/udp'
    volumes:
      - .:/etc/smartdns
    image: pymumu/smartdns:latest
 
  gost:
    restart: unless-stopped
    ports:
      - '80:8338'
      - '80:8338/udp'
    image: gogost/gost
    command: -L="ss://chacha20-ietf-poly1305:passwd@:8338" -F="socks5://easyconnect:1080"
 
networks:
  default:
    external: true
    name: ngpm
EOF

# 关闭系统的DNS，改用 smartdns
systemctl stop systemd-resolved && systemctl disable systemd-resolved && \
rm -rf /etc/resolv.conf && \
cat > /etc/resolv.conf <<EOF
nameserver 127.0.0.1
EOF

docker compose up -d
docker compose logs
```
+ 反代登录地址，访问并登录 EasyConnect

![](https://img.limour.top/2024/12/22/67670b5c2a2ba.webp)

## 二、使用客户端
+ [Android](https://github.com/shadowsocks/shadowsocks-android/releases)，特别说明：远程 DNS 填 `127.0.0.11`
+ [Windows](https://github.com/shadowsocks/shadowsocks-windows/releases)

## 三、解决内网 DNS
+ 一台内网的服务器，假设 ip 是 `10.184.107.127`
```bash
mkdir -p ~/app/smartdns && cd ~/app/smartdns && \
cat > smartdns.conf <<EOF
bind [::]:53 -no-speed-check
bind-tcp [::]:53 -no-speed-check
response-mode fastest-response
force-AAAA-SOA yes
log-console yes
log-level info
server 127.0.0.11
EOF

cat > docker-compose.yml <<EOF
version: '3.8'
services:
  smartdns:
    restart: unless-stopped
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    ports:
      - '2053:53'
      - '2053:53/udp'
    volumes:
      - ./smartdns.conf:/etc/smartdns/smartdns.conf
    image: pymumu/smartdns:latest
EOF

docker compose up -d

# 确认 内网 DNS 解析完好
dig @127.0.0.1 -p 2053 a zb.fudan.edu.cn
```

+ 回到外网服务端
```bash
# 确认 内网 DNS 解析完好
nslookup zb.fudan.edu.cn 127.0.0.1
```

## 四、进阶
+ [移除 EasyConnect CA 证书](./remove-untrusted-certificates-windows)
+ 链式代理：[使用Tunnel加速VPS的连接](./Use-Tunnel-to-speed-up-the-connection-of-VPS)
+ 浏览器插件：[ZeroOmega](https://github.com/zero-peak/ZeroOmega)
+ 单独重启某个容器、查看其日志、执行命令
```
docker compose down smartdns && \
docker compose up -d smartdns
docker compose logs smartdns

docker compose exec -it easyconnect \
cat /etc/hosts

docker compose exec -it easyconnect \
cat /usr/share/sangfor/EasyConnect/resources/logs/DNS.log

docker compose exec -it easyconnect \
busybox nslookup zb.fudan.edu.cn 
```