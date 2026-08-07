# Limour's Blog

基于 [Hexo](https://hexo.io/) 8 + [Fluid](https://hexo.fluid-dev.com/) 主题的静态博客，部署到 GitHub Pages（gh-pages 分支）。

> 本文档是**恢复本博客的唯一指南**：全新 `git clone` 之后，按本文操作即可完整还原可构建、可部署的站点。

---

## 环境要求

- Node.js >= 18（hexo 8 要求；当前开发环境为 Node 26）
- npm（依赖只安装到本地 `node_modules/`，**绝不全局安装**）
- SSH 密钥 `~/.ssh/github2_ed25519`（推送权限，见下文部署）

---

## 快速恢复（fresh clone 后按顺序执行）

```bash
# 1. 恢复配置文件（_config.yml 被 .gitignore 排除，不会随 clone 检出）
cp _config.yml.bak _config.yml

# 2. 本地安装依赖（npm install 默认就是本地安装，勿加 -g）
npm install

# 3. 恢复 node_modules 内的自定义补丁（⚠️ 关键步骤，见"主题补丁"）
git checkout -- node_modules/

# 4. 构建 & 预览
npx hexo clean
npx hexo generate        # 成功标志：INFO N files generated
npx hexo server          # 本地预览 http://localhost:4000

# 5. 部署到 GitHub Pages
npx hexo deploy          # 推送到 gh-pages 分支（SSH 验证，无 token）
```

**验证构建成功的标志**：`hexo generate` 输出 `INFO N files generated`（约 460 个文件），无 `FATAL`。

---

## 项目结构说明

| 路径 | 说明 |
|---|---|
| `_config.yml` | 站点主配置。**被 .gitignore 排除**（历史上含部署 token），需从 `_config.yml.bak` 复制 |
| `_config.yml.bak` | 主配置的模板副本（已去除 token，与 `_config.yml` 内容一致），随 git 跟踪 |
| `_config.fluid.yml` | Fluid 主题配置（38KB），随 git 跟踪 |
| `themes/` | **刻意保持为空**。主题以 npm 包形式安装（`hexo-theme-fluid`），这是正常状态，不是缺失 |
| `source/_posts/` | 博客文章（Markdown） |
| `scaffolds/` | 新建文章模板 |
| `public/` | 构建产物，被 .gitignore 排除 |
| `node_modules/` | 依赖，整体被 .gitignore 排除，**但 3 个补丁文件例外**（见下） |

---

## 主题补丁（⚠️ 必须恢复）

`node_modules/` 整体被 gitignore，但有 **3 个文件例外**被 git 跟踪——这是对 Fluid 主题源码的**自定义补丁**，属于本站定制功能：

| 补丁文件 | 定制内容 |
|---|---|
| `node_modules/hexo-theme-fluid/layout/_partials/head.ejs` | 用 `autoCanonical(config, page)` 生成 canonical 链接（替换主题自带的 canonical 代码块） |
| `node_modules/hexo-theme-fluid/scripts/generators/local-search.js` | 本地搜索索引：剥离 `<figure class="highlight">` 代码块、HTML 标签和 URL；`urlJoin` 去掉 `.html` 后缀 |
| `node_modules/hexo-theme-fluid/source/js/img-lazyload.js` | 懒加载图片：把 `/randomImg?d=` 请求替换为 `https://img.limour.top/randImg/XX.webp` 随机图 |

**为什么 clone 后必须 `git checkout -- node_modules/`**：
clone 时 git 只会检出这 3 个补丁文件（不含其余 node_modules）；随后 `npm install` 会全新解包 `hexo-theme-fluid`，**覆盖这 3 个文件为上游版本**。因此必须在 `npm install` 之后、`hexo generate` 之前恢复补丁。

**升级主题后注意**：`hexo-theme-fluid` 升版本（如 1.9.9 → 新版）会再次覆盖补丁文件。升级后需用 `git diff node_modules/` 检查差异，手动把补丁合并到新版本上，再 `git add` 提交新的补丁状态。

---

## 依赖清单（17 个，全部必需）

已做过逐一审计：**`hexo-renderer-pug` 曾存在但无任何 .pug 文件使用，已移除**，不要重新添加。

```
@traptitech/markdown-it-katex ^3.6.0    # KaTeX 数学公式（_config.yml 的 markdown.plugins）
hexo ^8.1.2                             # 核心
hexo-deployer-git ^4.0.0                # hexo deploy 推送
hexo-filter-links ^1.0.7                # 外链处理（links: 配置）
hexo-generator-archive ^2.0.0           # 归档页 archives/
hexo-generator-baidu-sitemap ^0.1.9     # 百度 sitemap（baidusitemap.xml）
hexo-generator-category ^2.0.0          # 分类页 categories/
hexo-generator-feed ^3.0.0              # RSS（atom.xml + rss2.xml）
hexo-generator-index ^3.0.0             # 首页
hexo-generator-sitemap ^3.0.1           # sitemap.xml
hexo-generator-tag ^2.0.0               # 标签页 tags/
hexo-neat ^1.0.9                        # HTML/CSS/JS 压缩（实测节省 20-30%，与 hexo 8 兼容）
hexo-renderer-ejs ^2.0.0                # 主题布局渲染（58 个 .ejs）
hexo-renderer-markdown-it ^7.1.1        # Markdown 渲染
hexo-renderer-stylus ^3.0.1             # 主题样式（42 个 .styl）
hexo-server ^3.0.0                      # 本地预览
hexo-theme-fluid ^1.9.9                 # 主题（npm 包形式）
```

---

## 部署方式（SSH，无 token）

已弃用 HTTPS + `ghp_xxxx` token 方式，改用 SSH 密钥验证推送：

```yaml
# _config.yml / _config.yml.bak 中的 deploy 段
deploy:
  type: git
  repo: git@github-2:limour-blog/limour-blog.github.io.git
  branch: gh-pages
```

依赖本机 `~/.ssh/config` 中的主机别名（**不在仓库内**，需自行配置）：

```
Host github-2
    HostName github.com
    User git
    IdentityFile ~/.ssh/github2_ed25519
    IdentitiesOnly yes
```

验证：`ssh -T github-2` 应返回 `Hi limour-blog! You've successfully authenticated...`

提交身份使用 git 全局配置（`user.name` / `user.email`），deploy 段不再含 name/email/token。

---

## 已知注意事项（踩过的坑）

1. **`--config` 不能指向非标准扩展名**：`hexo generate --config _config.yml.bak` 会静默加载失败并回退默认配置（渲染器不支持 `.bak` 扩展名），表现为 theme 变成默认 `landscape`、`{% note %}` 等 Fluid 标签报 `unknown block tag`。正确做法是先 `cp` 成 `_config.yml`。
2. **npm allow-scripts 已审结**：`hexo-util`（build:highlight，生成代码高亮语言别名 `highlight_alias.json`，**必需**）已批准；`ejs@2.7.4`、`highlight.js@9.18.5`（仅打印弃用提示）已拒绝。配置存于 `package.json` 的 `allowScripts` 字段，随 git 跟踪自动继承。若安装新依赖出现未审脚本，用 `npm approve-scripts --allow-scripts-pending` 审查；**不要拒绝 `hexo-util` 的 build:highlight**，否则 `js`/`ts`/`sh` 等简写语言名的代码块不高亮（`hexo-util/highlight_alias.json` 缺失）。
3. **hexo 8 API 变更**：`hexo.extend.tag.list()` 已不存在，检查标签注册需用 `hexo.extend.tag.env.hasExtension('note')`。
4. **`.bak` 与 `_config.yml` 必须保持同步**：修改配置时两处都要改（或用 `cp _config.yml _config.yml.bak` 同步）。
5. **`hexo clean` 后再 generate**：产物数量约 460 个文件属正常；若显示 `0 files generated` 是因缓存未变化，检查 `public/` 文件数即可。

---

## 版本记录

| 组件 | 版本 |
|---|---|
| hexo | 8.1.2 |
| hexo-cli | 4.3.2 |
| hexo-theme-fluid | 1.9.9 |
| Node.js | 26.5.0（>= 18 即可） |
