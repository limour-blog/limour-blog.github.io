---
title: 【分享】WEBP截图工具：ShareX + imagemagick
urlname: WEBP-jie-tu-gong-ju-ShareX--imagemagick
date: 2023-05-12 19:25:28
tags: ['webp', 'sharex', 'imagemagick']
---
WebP可为 Web 上的图像提供卓越的无损和有损压缩。使用 WebP，网站管理员和 Web 开发人员可以创建更小、更丰富的图像，从而使 Web 更快。与 PNG 相比，WebP 无损图像的大小要小 26% 。在同等 SSIM质量指数下， WebP 有损图像比可比较的 JPEG 图像小 25-34%

而平时用的截图功能，默认只提供png/jpeg格式的图片，手动转换太麻烦了。[Snipaste](https://github.com/Snipaste/feedback/issues/878) 的这个支持webp格式的issue也不知道解决了没有。😜

在搜索解决方法时，发现了[全站今日起使用WEBP格式，截图工具ShareX分享](https://michaelliunsky.cn/258.html)，这篇文章分享了通过 ShareX + imagemagick 的方式曲线支持截图为webp。用了一下，感觉不错，因此记录一下流程。😏
## 准备软件
+ [ShareX](https://getsharex.com) | [Github Repo](https://github.com/ShareX/ShareX)
+ [imagemagick](https://imagemagick.org/script/download.php) | [Github Repo](https://github.com/ImageMagick/ImageMagick)
+ imagemagick 下载第一个 Q16-HDRI-x64-dll.exe 就行，下载的是安装文件，需要运行进行安装。
## ShareX 动作设置
+ 按下图 `动作设置-动作-添加` 进入动作添加页面
![](https://img.limour.top/2023/08/30/64ef27d72ea1a.webp)
+ 按下图 配置动作 参数：`"$input" -quality 50 -define WebP:lossless=true "$output"`
![](https://img.limour.top/2023/08/30/64ef27eedee2e.webp)
## ShareX 截图任务
+ 按下图顺序设置截图后的任务顺序
![](https://img.limour.top/2023/08/30/64ef2802aabb6.webp)
+ 配置完成，按`截图快捷键`即刻体验

PS：本文的图片和标注均使用 ShareX 😆