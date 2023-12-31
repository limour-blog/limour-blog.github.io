---
title: 【记录】高级版问卷星 SurveyKing 搭建过程
urlname: gao-ji-ban-wen-juan-xing--SurveyKing--da-jian-guo-cheng
date: 2023-09-17 16:43:11
tags: [docker, ngpm]
---
问卷星的计算公式需要企业版，而开源的卷王也可以做到这一点，因此搭建卷王来替换掉问卷星。
> [SurveyKing](https://gitee.com/surveyking/surveyking): 功能最强大&搭建最简单&界面更美观的在线考试/调查问卷/公开查询/题库刷题/360度评估/投票系统，支持一键部署。

## 搭建步骤

+ 依赖: [反向代理](/Docker-bu-shu-Nginx-Proxy-Manager); [内网穿透](/-ji-lu--an-zhuang-npsfrp-fu-wu-duan-yu-ke-hu-duan)
+ 账号密码:  `admin/123456`

```bash
mkdir -p ~/app/surveyking && cd ~/app/surveyking && nano docker-compose.yml
sudo docker-compose up -d
```

```yml
version: '3'
services:
  survey:
    image: surveyking/surveyking:latest
    restart: unless-stopped
    ports:
      - '1991:1991'
    volumes:
      - ./files:/files
      - ./logs:/logs
```

## 使用体验
+ https://survey.limour.top/s/YWG9uf