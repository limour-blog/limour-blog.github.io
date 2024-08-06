---
title: 【探索】Windows配置QoS保证重要应用的网络通畅
urlname: Windows-configuration-QoS-ensures-smooth-network-connectivity-for-important-applications
index_img: https://api.limour.top/randomImg?d=2024-08-06 08:59:49
date: 2024-08-06 16:59:49
tags: [Windows, QoS]
---

## 开启组策略
+ 运行下面的 `.bat` 脚本
```cmd
@echo off
pushd "%~dp0"
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~3*.mum >List.txt
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~3*.mum >>List.txt
for /f %%i in ('findstr /i . List.txt 2^>nul') do dism /online /norestart /add-package:"C:\Windows\servicing\Packages\%%i"
pause
```

## 开启 QoS
+ win+r 运行 `gpedit.msc`
+ 计算机配置 -> 管理模板 -> 网络 -> QoS数据包计划程序 -> 限制可保留带宽

## 配置优先级
+ win+r 运行 `gpedit.msc`
+ 计算机配置 -> Windows 设置 -> 基于策略的 QoS
+ 在树形图“基于策略的 QoS”上右键，点选“新建策略”，在“新建策略”窗口中输入策略名称
+ 在“新建策略”窗口中，DSCP 值即为程序优先级（0-63），高于32则提升优先级，低于32则降低优先级。
+ 如果选中“指定出站调节率”，可对出站流量启用中止功能，然后指定一个大于 1 的值。设置完成之后，点击下一步。