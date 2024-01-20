---
title: 【记录】使用 tdl 下载 Telegram 中的视频
urlname: -ji-lu--shi-yong-tdl-xia-zai-Telegram-zhong-de-shi-pin
date: 2023-07-19 20:16:50
index_img: https://api.limour.top/randomImg?d=2023-07-19 20:16:50
tags: ['tdl', 'telegram', '下载器']
excerpt: iyear/tdl是一个Telegram下载器，具有单文件启动、低资源占用、吃满带宽、比官方客户端更快、支持从受保护的会话中下载文件和支持上传文件至Telegram等特点。安装时需要使用一键脚本，并且需要安装并登录Telegram客户端。登录后可以通过复制消息链接来下载文件，还可以使用命令恢复下载或重新下载。
---
[iyear/tdl](https://github.com/iyear/tdl) 是一个 Telegram Downloader，具有以下特性：
+ 单文件启动
+ 低资源占用
+ 吃满你的带宽
+ 比官方客户端更快
+ 支持从受保护的会话中下载文件
+ 支持上传文件至 Telegram

## 安装
```shell
$Script = iwr -useb https://ghproxy.com/https://raw.githubusercontent.com/iyear/tdl/master/scripts/install.ps1; $Block = [ScriptBlock]::Create($Script); Invoke-Command -ScriptBlock $Block -ArgumentList "", "$True"
```
+ 上面使用一键脚本安装(管理员) tdl
+ 同时还需要安装 [Telegram](https://telegram.org) 客户端并登录

## 登录
```
$env:TDL_NS = "quickstart"
$env:TDL_PROXY = "socks5://192.168.243.129:1580"
tdl login -d D:\app\Telegram
```

## 下载
1. 找到对应的消息
2. 右键复制链接 Copy Post Link，比如 `https://t.me/SMculture/7715`
3. `tdl dl -u https://t.me/SMculture/7715 -d C:\Users\limou\Downloads`

## 补充
```shell
# 恢复下载
tdl dl -u https://t.me/tdl/1 --continue
# 重新下载
tdl dl -u https://t.me/tdl/1 --restart
```