---
title: 【迁移】核酸检测完成情况提醒bot：shell解析json
urlname: -shell-jie-xi-json
date: 2022-10-08 15:03:57
tags: ['shell', 'json']
---

之前做了个核酸检测完成情况提醒bot，来给班群三天两次进行提醒。运行了一段时间后，发现微信每15天就会踢人下线，有点恶心。因此代码里的`toUserName`就不能再写死了，得通过api每天获取。这样就被踢了就只要重新登录一下，不用再改`toUserName`了。

## 获取UserName

*   sudo apt install jq
*   nano 04.sh
*   chmod +x 04.sh

```bash
#!/bin/bash
r=`/usr/bin/curl -X POST \
-H "Content-Type: application/json" \
-d '{"name": "临八一班男生群", "token":"123456"}' \
https://limour.top/api/search_chatrooms`
r=`echo $r  jq -r '.UserName'`
echo $r > /root/task/UserName01
 
r=`/usr/bin/curl -X POST \
-H "Content-Type: application/json" \
-d '{"name": "19临八2班通知群", "token":"123456"}' \
https://limour.top/api/search_chatrooms`
r=`echo $r  jq -r '.UserName'`
echo $r > /root/task/UserName03
```

## 修改UserName获取方式

```bash
#!/bin/bash
r=`cat /root/task/UserName01`
/usr/bin/curl -X POST \
-H "Content-Type: application/json" \
-d '{"fileDir": "/root/itchat/COVID.19.testing.png", "toUserName":"'$r'", "token":"123456"}' \
https://limour.top/api/send_image
```

```bash
#!/bin/bash
r=`cat /root/task/UserName03`
/usr/bin/curl -X POST \
-H "Content-Type: application/json" \
-d '{"msg": "大家记得今日填写平安复旦\n网页：https://zlapp.fudan.edu.cn/site/ncov/fudanDaily\n小程序：#小程序://复旦eHall/iOrJWtnyhqp2sos", "toUserName":"'$r'", "token":"123456"}' \
https://limour.top/api/send
```

## shell给图片添加文字水印

上辈子造了孽，这辈子用微信。shell解析json后，微信又出幺蛾子了，核酸检测表格的图片被屏蔽了，只有自己能看到，群里其他人看不到。现在需要每天给图片加点料，避开微信的检测。

### 安装依赖

*   apt update
*   apt install imagemagick

### 添加水印的脚本

```bash
#!/usr/bin/env bash
text=`date`
convert /root/itchat/COVID.19.testing_raw.png \
-gravity southeast -fill black -pointsize 16 \
-draw "text 5,5 '$text'" \
/root/itchat/COVID.19.testing.png
```

*   nano sb\_wechat.sh && chmod +x sb\_wechat.sh

### 添加定时执行

*   crontab -e
*   0 7 \* \* \* /root/itchat/sb\_wechat.sh
*   crontab -l