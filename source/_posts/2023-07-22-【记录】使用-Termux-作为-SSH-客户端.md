---
title: 【记录】使用 Termux 作为 SSH 客户端
urlname: -ji-lu--shi-yong-Termux-zuo-wei-SSH-ke-hu-duan
date: 2023-07-22 20:19:40
tags: ['termux', 'ssh']
excerpt: 这段文字是关于在Termux上安装和配置Alpine Linux以及使用SSH登录的指南。首先需要下载并安装Termux应用，然后通过命令行安装proot-distro并使用它来安装Alpine Linux。接下来需要修改Alpine Linux的软件源为清华大学镜像并更新软件包并安装openssh。然后可以通过编辑SSH配置文件并生成SSH密钥来设置快捷登录。最后，可以使用SSH命令直接登录到指定的主机上。
---
## 安装 Termux
+ 下载 [termux-app](https://github.com/termux/termux-app)（[点此镜像加速](https://github.com/zwc456baby/file-proxy)）
```bash
pkg install proot-distro
proot-distro install alpine
proot-distro login alpine
sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
apk update && apk add openssh
```
## 快捷登录
```ini
host SER5
  user root
  hostname limour.top
  Port 22
  # PreferredAuthentications publickey
  # IdentityFile ~/.ssh/id_rsa
```
```bash
nano ~/.ssh/config # 写入上面的配置文件
ssh-keygen -t rsa
ssh-copy-id SER5
nano ~/.ssh/config # 将注释取消掉
ssh SER5 # 即可直接登录
```