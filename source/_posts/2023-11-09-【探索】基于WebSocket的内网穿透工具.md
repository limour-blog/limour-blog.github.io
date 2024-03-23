---
title: 【探索】基于WebSocket的内网穿透工具
urlname: WebSocket-based-intranet-penetration-tool
date: 2023-11-09 19:38:50
index_img: https://api.limour.top/randomImg?d=2023-11-09 19:38:50
tags: ['docker', 'ngpm', "ws", "内网穿透", 'ssh', '探索']
excerpt: 国内的服务器备案麻烦，所以很多内网服务需要使用内网穿透工具。之前尝试使用QUIC来伪装，但不稳定。现在找到了一个特征少的内网穿透工具ProxyNT，可以通过NAT和防火墙将本地服务器暴露到公网上。使用Docker部署服务端和客户端，配置相应的参数后即可使用。
---
国内的服务器除了挂个备案，不想再要了。而许多内网的服务需要在外网访问，内网穿透是必不可少的。但是用国外的服务器的话，需要过一层未知的东西，难免被误伤，融入汪洋大海也是必须的。之前折腾了一下通过套一层[QUIC](/Protocol-for-intranet-penetration-based-on-QUIC)来伪装，不知道为什么，总是不稳定。寻寻觅觅，又找到一个特征少的内网穿透工具：[ProxyNT](https://github.com/sazima/proxynt) 。ProxyNT是一个用python编写的基于WebSocket的反向代理服务器，可以透过NAT和防火墙将本地服务器暴露到公网上，从原理看，套上一层CDN保护公网ip也是可以的。
## 服务端
+ [反向代理服务](/Docker-bu-shu-Nginx-Proxy-Manager)
```bash
mkdir -p ~/app/proxynt && cd ~/app/proxynt && nano Dockerfile && nano docker-compose.yml
docker build -t limour/proxynt .
nano config.json
sudo docker-compose up -d
```
```Dockerfile
FROM python:3.9-alpine
RUN pip install -U python-snappy
RUN pip install -U https://github.com/sazima/proxynt/archive/refs/heads/snappy.zip
ENTRYPOINT ["nt_server", "-c", "/opt/config.json"]
```
```yml
version: '3.3'
services:
  proxynt:
    restart: unless-stopped
    volumes:
      - './config.json:/opt/config.json'
      - '/etc/localtime:/etc/localtime:ro'
    image: limour/proxynt
 
networks:
  default:
    external: true
    name: ngpm
```
```json
{
    "port": 18888,
    "log_file": "/dev/null",
    "path": "/websocket_path",
    "password": "helloworld",
    "admin": {
        "enable": true,
        "admin_password": "new_password"
    }
}
```

![反代 proxynt:18888](https://img.limour.top/2023/11/09/654cc58f6ea33.webp)
## 客户端
+ [GitHub 文件加速](/-fu-ke-GitHub-wen-jian-jia-su)
```bash
mkdir -p ~/app/proxynt && cd ~/app/proxynt
# pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
# pip install --use-pep517 python-snappy -i https://pypi.tuna.tsinghua.edu.cn/simple
pip install -U python-snappy -i https://pypi.tuna.tsinghua.edu.cn/simple
pip install -U  https://xxx.limour.top/token/https://github.com/sazima/proxynt/archive/refs/heads/snappy.zip
whereis nt_client
```
```bash
nano config.json
nt_client -c config.json # 测试
nano proxynt.sh && chmod +x proxynt.sh
nano proxynt.service
sudo mv proxynt.service /etc/systemd/system/proxynt.service
sudo systemctl enable proxynt
sudo systemctl start proxynt
sudo systemctl status proxynt
```
```json
{
  "server": {
    "url": "wss://limour.top:443/websocket_path",
    "password": "helloworld",
    "compress": true
  },
  "client_name": "home_pc",
  "log_file": "/home/limour/app/proxynt/nt.log"
}
```
```bash
#!/bin/sh
export PYTHONPATH=/home/limour/.local/lib/python3.10/site-packages
/home/limour/.local/bin/nt_client -c /home/limour/app/proxynt/config.json
```
```ini
[Unit]
Description=proxynt
After=network.target
[Service]
ExecStart=/home/limour/app/proxynt/proxynt.sh
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
[Install]
WantedBy=multi-user.target
```
+ 访问 `https://limour.top:443/websocket_path/admin`
+ 看到客户端上线后，新建配置即可

## 附加 WebSSH
和上面的内网穿透配合，连接时host填`proxynt`,可以保证内网ssh不暴露公网的同时，又能通过公网进行ssh连接。
```bash
mkdir -p ~/app/webssh && cd ~/app/webssh && nano docker-compose.yml
sudo docker-compose up -d
```
```yml
version: '3.3'
services:
  webssh:
    restart: unless-stopped
    environment:
      - GIN_MODE=release
      - savePass=true
    volumes:
      - '/etc/localtime:/etc/localtime:ro'
    image: jrohy/webssh:latest
 
networks:
  default:
    external: true
    name: ngpm
```

![反代 webssh:5032](https://img.limour.top/2023/11/10/654d918353361.webp)