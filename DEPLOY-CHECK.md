# 部署前检查（每次部署前必做）

## 人工检查流程（用户主导）

用户说「我检查一下效果」或类似表述时：

1. 先构建：`npx hexo g`，确认无 FATAL
2. 启动预览：`npx hexo s -p 3000`，后台启动
3. **然后停下，等用户手动打开 http://localhost:3000/ 检查**
   - 不要替用户检查页面效果，用户会自己看浏览器
   - 用户看完后会告知结果（效果 OK / 需要修改）
4. 用户确认无误后再部署：`npx hexo deploy`

## 检查要点（用户自查参考）

浏览器打开 http://localhost:3000/ 检查首页/文章/标签/归档等页面效果。

## 已知情况说明

- 主题引用 `/cdn/...` 路径，由 `sw.js` 拦截并从外部 CDN 缓存提供；
  curl 直接访问 `/cdn/` 返回 404 属预期，浏览器里正常。
- 首页 HTML 内置 SW 注册 + ready 后自动 reload，首屏后 `/cdn/` 资源正常。
- alicdn 图标字体为协议相对 URL，curl 需加 https 前缀验证。
- 404.html 301 重定向到 /404 属预期。
- 若「我检查一下效果」时发现 gh-pages 与本地不一致，说明上次没部署。
- harness bash 环境下 `nohup ... &` 启动的 hexo 会随命令退出被杀；
  必须用 `setsid nohup ... < /dev/null & disown` 才能常驻。
- 预览启动初期服务器在做 neat html/css 处理，curl 可能返回 000，
  等约 20 秒再检查（HTTP 200 = 就绪）。
## 命令速查

```bash
npx hexo g             # 构建；成功标志：INFO N files generated，无 FATAL
setsid nohup npx hexo s -p 3000 > /tmp/hexo-server.log 2>&1 < /dev/null & disown   # 后台启动预览 http://localhost:3000/（harness 下需 setsid 常驻）
pkill -f "hexo s"      # 停止预览服务（注意 pgrep -f hexo 可能匹配到自身命令）
npx hexo deploy        # 确认无误后再部署到 gh-pages 分支
```

> 注意：预览服务不停止也能 deploy，但会占用端口；检查完记得停掉。
