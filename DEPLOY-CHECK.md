# 部署前检查（每次部署前必做）

## 人工检查流程（用户主导）

用户说「我检查一下效果」或类似表述时：

1. 先构建：`npx hexo g`，确认无 FATAL
2. 启动预览：`npx hexo s -p 3000`，后台启动
3. **然后停下，等用户手动打开 http://localhost:3000/ 检查**
   - 不要替用户检查页面效果，用户会自己看浏览器
   - 用户看完后会告知结果（效果 OK / 需要修改）
4. 用户确认无误后再部署：`npx hexo deploy`

## 部署确认流程（部署后必做）

1. `npx hexo deploy` 部署到 gh-pages 分支
2. 验证远程分支已推送：`git ls-remote git@github-2:limour-blog/limour-blog.github.io.git gh-pages`
   - 返回的 commit 必须与 deploy 输出里的新 commit（`HEAD -> gh-pages (forced update)` 前的 hash）一致
3. ssh b 执行 `~/update-hexo.sh` 拉取并更新服务器
   - 成功标志：`HEAD is now at <commit> Site updated: ...`
4. 三端 commit 一致（本地推送 / 远程 gh-pages / 服务器 b HEAD）= 部署完成

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
- 直接 `setsid nohup npx hexo s ...` 单行后台启动可能失败（无输出、日志未生成），
  疑似 rtk 命令包装干扰；稳妥做法是先 `cat > /tmp/start-hexo.sh` 写好脚本，
  再 `setsid /tmp/start-hexo.sh < /dev/null > /dev/null 2>&1 & disown` 启动。
- 停止预览：`pkill -f "hexo s"` 可能误杀自身 bash 包装命令（命令行含 hexo s 字样）
  而杀不掉真正的 hexo 进程；改用 `ss -tlnp | grep ':3000'` 找 pid= 再 kill 最可靠。
- 预览启动初期服务器在做 neat html/css 处理，curl 可能返回 000，
  等约 20 秒再检查（HTTP 200 = 就绪）。
- `npx hexo g` 输出 `0 files generated` 属正常（增量构建），关键看无 FATAL
  且后续有 neat the html 处理日志。
- deploy 成功标志：`INFO Deploy done: git` + `HEAD -> gh-pages (forced update)`；
  输出里的 `branch 'master' set up to track ...` 是 hexo-deployer-git 内部提示，非错误。
- deploy 后必须用 git ls-remote 校验远程 commit，再 ssh b 执行 ~/update-hexo.sh，
  服务器 HEAD 与远程 commit 一致才算部署完成。
## 命令速查

```bash
npx hexo g             # 构建；成功标志：INFO N files generated（0 files 属增量正常），无 FATAL
# 后台启动预览（推荐脚本方式，见下方「启动脚本」）
cat > /tmp/start-hexo.sh <<'EOF'
#!/bin/bash
cd /home/limour/limour-blog.github.io
exec npx hexo s -p 3000 > /tmp/hexo-server.log 2>&1
EOF
chmod +x /tmp/start-hexo.sh && setsid /tmp/start-hexo.sh < /dev/null > /dev/null 2>&1 & disown   # 启动后访问 http://localhost:3000/
port_pid=$(ss -tlnp 2>/dev/null | grep ':3000' | grep -oP '(?<=pid=)\d+' | head -1) && kill "$port_pid"   # 停止预览服务（按监听端口找 PID）
npx hexo deploy        # 确认无误后再部署到 gh-pages 分支；成功标志：Deploy done: git + forced update
git ls-remote git@github-2:limour-blog/limour-blog.github.io.git gh-pages   # 校验远程 commit 与 deploy 输出一致
ssh b 'bash ~/update-hexo.sh'   # 服务器拉取更新；成功标志：HEAD is now at <commit>
```

> 注意：预览服务不停止也能 deploy，但会占用端口；检查完记得停掉。
