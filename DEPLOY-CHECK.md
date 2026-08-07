# 部署前检查（每次部署前必做）

部署前先在本地构建并预览，人工确认页面效果无误后再推送：

```bash
npx hexo g             # 构建；成功标志：INFO N files generated，无 FATAL
npx hexo s -p 3000     # 本地预览 http://localhost:3000/（默认端口 4000，-p 指定）
# 浏览器人工检查首页/文章/标签/归档等页面效果
# 检查完毕停止预览服务：Ctrl+C；后台启动可用 kill $(pgrep -f "hexo s")
npx hexo deploy        # 确认无误后再部署到 gh-pages 分支
```

> 注意：预览服务不停止也能 deploy，但会占用端口；检查完记得停掉。
