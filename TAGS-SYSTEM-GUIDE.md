# 标签系统与批量重构指南

> 本文档基于 2026-08-07 的大规模标签整理（commit `0ac6f90`）总结而成，
> 用于指导后续对 `source/_posts/` 的大规模批量修改（标签合并、隐藏文章、改格式等）。

---

## 1. 博客概况

- 框架：Hexo 8 + Fluid 1.9.9（`node_modules/hexo-theme-fluid/`）
- 文章目录：`source/_posts/`（当前 171 篇 .md，全站不用 `categories`，只用 `tags`）
- 前端模板字段（近期风格，按出现顺序）：

```yaml
---
title: 【观点】何谓年轻
urlname: what-does-it-mean-to-be-young
index_img: https://api.limour.top/randomImg?d=2026-07-12 19:35:27
date: 2026-07-13 03:35:27
tags: 观点
excerpt: 读《这世界既残酷也温柔》有感
hide: true   # 可选
---
```

- `urlname` 决定永久链接（`permalink: :urlname.html`），**不要随意改动**，否则旧链接 404。

---

## 2. 标签系统现状

### 2.1 格式约定（近期风格）

| 场景 | 写法 | 示例 |
|---|---|---|
| 单标签 | `tags: 标签名`（不带引号） | `tags: 杂感` |
| 多标签 | `tags: [a, b]`（不带引号、逗号+空格） | `tags: [故事, 观点]` |

历史遗留的杂格式（本次已全部修掉，以后新文章不要再用）：
`tags: '药理'`、`tags: ['gost']`、`tags: [ 'CloudFlare', 'GitHub']`、`tags: ["内网穿透", '探索']` 等。

### 2.2 已合并的标签（别名映射表）

| 合并前（历史别名） | 合并后（唯一标准） |
|---|---|
| `win10` / `win11` / `Windows` / `windows` | `win` |
| `Github` | `GitHub` |
| `OpenAI` | `openai` |
| `translation` | `翻译` |
| `PDF` | `pdf` |

后续再遇到新别名，往这张表里加即可。

### 2.3 常用标签（按使用次数，前 20）

`docker(27)` `ngpm(15)` `探索(12)` `openai(11)` `故事(10)` `杂感(9)` `llama(8)` `绘图(7)` `win(7)` `药理(6)` `设定(6)` `raspberrypi(4)` `转载(4)` `翻译(4)` `科幻(4)` `alist(4)` `观点(4)` `ssh(3)` `生信(3)` `jupyter(3)` `R(3)` …

> 注意：`药理`、`寄生虫`、`从零开始配置VPS` 等标签仅存在于已隐藏（hide: true）的文章里，
> 生成站点上这些标签页会消失（残留目录见 §5 坑3）。

### 2.4 文章前缀分类与「近期博客风格」判定

文件名/标题前缀即文章类别，也是判定是否隐藏的第一依据：

**符合近期风格（保留）**：
`观点` `故事` `设定` `杂感` `宏观` `想法` `绘图` `转载`(有意义的文章) `翻译`(有分量的长文)
`记录` `探索`(结构化技术笔记，如 2025–2026 年的)

**不符合近期风格（隐藏 hide: true）**：
- `迁移` —— 从旧博客导入的零散技术笔记，**主要隐藏对象**（51 篇中隐藏 50 篇）
- `学习` `复习` —— 学习笔记
- `药理` `寄生虫` `呼吸` —— 医学课业笔记
- 一次性旧分类：`从零开始配置VPS` `树莓派` `分享` `白嫖` `避坑`

**经验规则**：判断标准是「内容形态」，不是发布日期——
例：`2023-02-12【迁移】人类不该承担文明的沉重负担…` 虽是迁移前缀，但内容是杂感风格，故保留。

---

## 3. hide: true 机制（Fluid 主题）

- 作用：从**首页 / 归档 / 标签页**列表中移除，但**文章页面本身仍会生成**，直链可访问。
- 实现：`node_modules/hexo-theme-fluid/scripts/filters/post-filter.js`
  - `hidePosts = allPosts.filter(post => post.hide)` → 注入 `locals.hide_posts`
  - 列表用 `locals.posts`（不含 hide），页面生成用 `all_posts`（含 hide）
- 因此「隐藏」是软隐藏，适合：旧文归档、未完成草稿、不想上首页但保留链接的内容。

---

## 4. 批量修改方法（本次实战流程）

### 4.1 通用脚本模板

所有字段都在 frontmatter 单行内，用正则即可安全处理（171 篇已验证）：

```python
#!/usr/bin/env python3
import os, re

POSTS_DIR = 'source/_posts'
TAG_MAP = { 'win10': 'win', 'win11': 'win', 'Windows': 'win', 'Github': 'GitHub' }  # 别名合并

def parse_tags(line):           # 兼容 标量 / '标量' / [a, b] / ['a', 'b'] / ["a"] 等写法
    raw = line.strip()
    if raw.startswith('['):
        return [x.strip().strip('"\'').strip() for x in raw[1:-1].split(',') if x.strip()]
    return [raw.strip().strip('"\'').strip()]

def format_tags(items):         # 输出近期风格
    items = [TAG_MAP.get(x, x) for x in items]
    uniq = list(dict.fromkeys(items))
    return f'tags: {uniq[0]}' if len(uniq) == 1 else 'tags: [' + ', '.join(uniq) + ']'

def process(fname):
    path = os.path.join(POSTS_DIR, fname)
    content = open(path, encoding='utf-8').read()
    m = re.search(r'^---\n(.*?)\n---', content, re.S)   # 坑1：见 §5
    if not m: return f'[SKIP 无frontmatter] {fname}'
    fm = m.group(1)
    tm = re.search(r'^tags:\s*(.+)$', fm, re.M)
    if not tm: return f'[SKIP 无tags] {fname}'
    new_fm = fm[:tm.start()] + format_tags(parse_tags(tm.group(1))) + fm[tm.end():]
    # 需要隐藏时在 tags 行后插入 hide: true
    # new_fm = new_fm.replace('^tags:.*$', ...)  # 按需
    open(path, 'w', encoding='utf-8').write(content[:m.start(1)] + new_fm + content[m.end(1):])

for f in sorted(os.listdir(POSTS_DIR)):
    if f.endswith('.md'):
        r = process(f)
        if r: print(r)
```

### 4.2 隐藏判定写法（本次）

```python
HIDE_EXCEPT = { '2023-02-12-【迁移】人类不该承担文明的沉重负担，文明应当是岁月流逝的光彩照耀.md' }
needs_hide = fname in HIDE_EXTRA or ('【迁移】' in fname and fname not in HIDE_EXCEPT)
```

### 4.3 验证流程（每次批量修改必做）

```bash
# 1) 构建验证
npx hexo generate          # 确认无报错（本次 327 files / 7.9s）

# 2) 抽查归档/标签页不含隐藏文章
grep -rl "关键字" public/archives/ | wc -l          # 应为 0
ls public/tags/ | grep -E "^win"                     # 应只剩 win（聚合成功）

# 3) 中文文件名 diff 统计（git 默认输出会转义，用 -z + python）
git diff --name-only -z -- source/_posts/ | python3 -c "import sys; print([f for f in sys.stdin.buffer.read().decode().split('\0') if f])"

# 4) 检查残留引号/旧格式
grep -rn "tags: \['" source/_posts/*.md              # 应为空
```

---

## 5. 踩过的坑（重要）

1. **文件首行空行会破坏 frontmatter 正则**：`2022-07-13-【迁移】树莓派：Rclone-aria2做Onedrive离线下载机.md`
   文件以空行开头，`^---\n` 匹配不到 → 脚本静默跳过。**必须加一个「无 frontmatter」的报告分支**，最后人工补处理。
2. **git diff 显示中文文件名会转义成 `\343\200\220…`**：shell 循环处理会找不到文件，用 `git diff --name-only -z` + Python 解析。
3. **删除标签后 public/ 残留空目录**：`win10/`、`药理/` 等目录还在但 index.html 已删。
   无害，`hexo clean && hexo generate`（或部署流程自带 clean）即可清掉；不要手动删 source 下的东西。
4. **tags 可能缺失**：个别文件没有 `tags:` 行，脚本要有 skip 报告，不要静默。
5. **不要动 `urlname` / `date`**：改 urlname 会 404，改 date 会影响归档排序。
6. **隐藏前先确认已有 hide 的文章**（本次原有 2 篇：`2023-10-29 探索Tunnel`、`2026-08-07 三种人`），避免重复插入。

---

## 6. 本次变更记录（参考基线）

- commit：`0ac6f90 chore: 整理所有文章标签, 隐藏不符合近期风格的旧文`
- 范围：94 篇修改（60 篇加 `hide: true` + 34 篇仅格式整理），125 insertions / 65 deletions
- 结果：171 篇 → 62 篇隐藏（50 迁移 + 10 一次性分类 + 2 原有）、109 篇可见
- 标签数：从 ~150+ 个合并/规范化，win/win10/win11/Windows 等别名已收敛

---

## 7. 后续建议

- 新文章 frontmatter 直接按 §2.1 的近期风格写，`excerpt` 建议保留（首页展示更美观）
- 若要彻底删除隐藏旧文（而非软隐藏），先确认直链访问量/外链引用再删
- 后续别名合并：先 `python` 统计全部 tags（见 §2.3 的统计脚本思路），把新别名加入 `TAG_MAP` 再跑一遍 §4.1 模板
- 大规模改动前先 `git stash`/确认工作区干净，改完按 §4.3 验证后再 commit
