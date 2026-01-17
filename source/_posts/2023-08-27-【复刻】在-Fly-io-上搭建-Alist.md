---
title: 【复刻】在 Fly.io 上搭建 Alist
urlname: -fu-ke--zai-Flyio-shang-da-jian-Alist
date: 2023-08-27 20:46:29
index_img: https://api.limour.top/randomImg?d=2023-08-27 20:46:29
tags: alist
excerpt: 在moeyy的教程《使用Fly.io部署Alist》完成后，还有一些优化体验的小细节需要注意。首先，需要获取管理员账号，可以使用命令"flyctl ssh console"来获取。接下来，需要更改静态资源地址，可以使用Cloudflare反代jsDelivr来实现。然后，需要新建一个Worker并替换其中的内容。最后，需要在AList管理页面中将所有的cdn.jsdelivr.net修改为自己反代的地址，并在Vercel上部署Waline来添加评论系统。
---
按 [@moeyy](https://moeyy.xlog.app/) 的教程《[使用 Fly.io 部署 Alist](https://web.archive.org/web/20240826052308/https://moeyy.cn/blog/deploy-alist-on-flyio)》完成后，还有一些优化体验的小细节，在此记录一下。
## 2026年更新
+ Fly.io 免费不稳定了，Alist也被卖了
+ 请转向 [搭建 OpenList](/set-up-openlist)
## 获取管理员账号
```bash
flyctl ssh console # 如果失败，打开所部署的应用页面，刷新后多尝试几次
./alist admin random
```
## 添加评论系统
+ [搭建Waline评论系统](/build-waline-comment-system)
## 自定义域名
+ DNS 解析只能是<仅 DNS>
+ Domain ownership verification 是 **CNAME**
![](https://img.limour.top/2023/08/30/64ef3b77a0779.webp)

## 版本更新
+ 进 alist 后台 `备份 & 恢复` 进行一次备份以防万一
+ 可能需要验卡: [high-risk-unlock](https://fly.io/high-risk-unlock)
```bash
cd alist-fly
flyctl deploy
```
## 修复 stuck
+ [Machine stuck in replacing state](https://community.fly.io/t/machine-stuck-in-replacing-state/16105)
```bash
cd alist-fly

# 获取 volumes 的可用快照 vs_D2l
fly volumes show
# 恢复快照 得到 vol_r7q
fly volumes create data \
--snapshot-id vs_D2l \
--size 1 \
-a alist-fly-limour

# 获取 stuck 的 machine id 178
fly machine  list
# 另起一台 machine
fly machine clone 178 \
--attach-volume vol_r7q:/opt/alist/data \
--app alist-fly-limour

# 删除 stuck 的 machine
fly machine destroy -f 178 --app alist-fly-limour
# 删除 stuck 的 machine 所用的 volumes
fly volumes destroy vol_zre
```

## 演示地址
+ https://od.limour.top