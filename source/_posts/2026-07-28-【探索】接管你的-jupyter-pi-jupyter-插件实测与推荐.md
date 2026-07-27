---
title: 【探索】接管你的 Jupyter
urlname: pi-jupyter
index_img: https://api.limour.top/randomImg?d=2026-07-27 17:41:57
date: 2026-07-28 01:41:57
tags: [探索, openai]
excerpt: 让 Coding Agent 直接接管你的 Jupyter —— pi-jupyter 插件实测与推荐
---

> 一句话：pi-jupyter 让本机的 pi-agent 通过标准协议连上一个**真实、持久、可在浏览器打开**的 Jupyter kernel，于是 agent 能在远程 / 超算环境里跑代码、装包、出图、存 notebook，而且**和你共用同一个会话**。我在 R 与 Python 两种内核上各做了一轮实测，核心功能全部通过。下面聊聊它解决了什么，以及两个最让我惊喜的亮点。

## 0. 两个真实痛点

用 coding agent 写数据分析 / 科研代码时，我长期被两件事折磨：

1. **算力围墙**。agent 默认在本机沙箱里执行代码，可我的数据几十 GB、模型要吃 GPU、环境是超算上预装好的科学计算栈——本机根本没有。于是 agent 只能"纸上谈兵"，真正要跑还得我 SSH 上去手动操作。
2. **协作孤岛**。即便 agent 能跑代码，它跑的 kernel 是个黑盒：它定义的变量我看不到，我在 notebook 里调好的 dataframe 它也不知道。人和 agent 各玩各的，无法结对。

pi-jupyter 这个 pi 扩展，恰好把这两堵墙一起拆了。

## 1. pi-jupyter 是什么

它给 pi-agent 注册了三个工具，背后连的是一个**远程 Jupyter Server** 上的持久 kernel：

- `jupyter_repl`：在持久会话里执行代码。变量、import、已装包在多次调用之间一直保留；最后一个表达式的值作为结果返回，`print` 走标准输出，图像（matplotlib / ggplot2）会**内联**回传。
- `jupyter_add_dependencies`：往正在运行的 kernel 里**热装**依赖，无需重启（Python 走 pip，R 走 CRAN）。
- `jupyter_save_notebook`：把当前会话直接导出成标准 `.ipynb`，可在 JupyterLab / VS Code 里打开。

最小例子（Python 内核）：

```python
# jupyter_repl
import sys
print("Python:", sys.version.split()[0])
x = 100
x * 2          # → 200，且 x 在下次调用里仍然存在
```

就这么简单：agent 不再是"在本地起个临时子进程跑一下"，而是**坐在一个真正的、有状态的 Jupyter 会话里**工作。这一点，是后面所有亮点的地基。

## 2. 亮点一：本机 agent，直连内网超算集群的 Jupyter

这是我认为价值最大的一点。

pi-jupyter 走的是 Jupyter Server 自己的 HTTP / WebSocket 协议 + token 鉴权，所以**那个 kernel 不必在本机**。你在内网超算上（JupyterHub、或 Slurm 交互作业里拉起的 jupyter server）把地址和 token 配给 pi，本机的 agent 就能把整台超算当成它的"远程执行后端"：

- 远程跑训练 / 大规模分析，**数据不用往本机搬**；
- 远程 `pip` / `conda` / R 装包，装的是**超算环境里的包**；
- 远程出图，PNG 直接内联回 agent 的对话里；
- 远程把 notebook 存到**超算的文件系统**。

换句话说，超算上有 GPU、有大内存、有预装科学栈、有数据集，却唯独缺一个交互式的 coding agent——pi-jupyter 把这个缺口补上了，而且**不需要把超算暴露到公网**，内网可达即可，鉴权沿用 Jupyter 既有机制。

我这次实测本身就是一次"连远程 Jupyter"的演练，有两个细节很能说明问题：

- 每次执行返回的 kernel id 形如 `remote-1785173224902-...`，明确是**远程**会话，而非本地子进程；
- 在远端跑 `whoami` 返回的是 `jovyan`——这正是 Jupyter 官方容器栈的默认用户，说明对端是一个容器化的远程环境。

把这台远程机换成你内网超算上的 Jupyter，链路是完全同构的。对科研 / HPC / 数据团队来说，这意味着：**让 agent 在超算上"动手"，从此和在本机一样自然。**

## 3. 亮点二：人和 agent，共用同一个 session 的"结对编程"

第二个让我眼前一亮的点，来自一个关键设计选择：pi-jupyter 操作的 session 是**真实且外部可见**的——你可以在浏览器的 JupyterLab 里打开**同一个** notebook / kernel。

于是就出现了一种很妙的协同：

- 你在网页端做需要直觉的部分——扫一眼分布、调个图、改个超参；
- agent 在终端（pi 的 TUI）里做繁琐的部分——查文档、写胶水代码、批量处理、跑循环；
- **双方共享同一块变量空间、同一份已装包、同一段 cell 历史**。你定义的 `df`，agent 下一条调用就能接着 group by；agent 热装的包，你刷新一下网页端就能 `import`；agent 跑的中间结果，你在 notebook 里直接看得到。

这跟"agent 私下跑个隐藏 kernel"是本质区别。后者人和 agent 永远是两个世界；而 pi-jupyter 让两端落在**同一个会话**上，体验接近 VSCode Live Share，只不过你的结对搭档是 AI。它也顺手解决了调试时的割裂感：agent 卡住了，你在网页端 inspect 一下变量、补一行修正，agent 接着往下跑，上下文一字不丢——因为上下文本来就在 kernel 里，谁也没"拥有"它，大家共用。

配合 `jupyter_save_notebook`，这份人机共同写就的 notebook 还能一键落盘成标准 `.ipynb` 归档或分享，复现性也有了着落。

## 4. 跨内核 & 工程细节：实测都过了

光有理念不够，我做了两轮实测，**R 与 Python 两种内核各跑一遍**，验证它不是只能在某一种环境里 work：

- **第一轮 · R 内核（R 4.3.1）**：连跑 10 项，全部通过——基础执行、跨调用变量持久、`cat` / `print` 与返回值分离、错误捕获（`log("not a number")` 干净报错并带 traceback）、`jupyter_add_dependencies` 热装 `whoami` 并验证、ggplot2 散点 + 回归线内联出图、`dependencies` 参数预装 `pingr`、大表格 `summary` + `head` 不截断、`timeout_secs` 精确中断长任务（`Sys.sleep(5)` 在 2s 超时下抛出 `TimeoutError`）、导出 notebook 校验为 nbformat 4。
- **第二轮 · Python 内核（3.11.6）**：核心功能复测通过——执行正确、`x = 100` 跨调用持久、`dependencies=["matplotlib"]` 即时热装并内联出折线图、导出 notebook 校验为 nbformat 4 / kernel `python3`。

几个工程上的好感点：

- **依赖双向可装**：既能中途 `jupyter_add_dependencies` 热装，也能在 `jupyter_repl` 调用时带 `dependencies` 预装，装完即用，不重启 kernel。
- **输出通道干净**：stdout、返回值、图像、错误 / 堆栈四类各走各路，互不污染；报错不会把会话搞挂。
- **超时保护到位**：`timeout_secs` 能精确掐断死循环 / 长任务，避免会话挂死，这对远程 / 超算场景尤其重要——你总不想一个失控 cell 把超算作业占着。
- **导出规范**：`.ipynb` 是合法 nbformat 4，cell 与 output 一一对应，JupyterLab / VS Code 直接打开无碍。

| 实测 | 内核 | 结果 |
|---|---|---|
| 第一轮 | R 4.3.1 | 10 / 10 通过 |
| 第二轮 | Python 3.11.6 | 核心功能全通过 |

## 5. 适合谁 & 上手提示

如果你属于以下任意一种，强烈建议试试：

- 在**超算 / 远程服务器 / 容器**上做科研或数据分析，希望 agent 能直接在那儿动手；
- 想让 agent 和你**共用一个 notebook**，而不是各跑各的；
- 需要 agent 在**有状态**的环境里做多步探索（数据科学天然是 REPL 工作流）。

上手上只需把目标 Jupyter Server 的地址与 token 配给 pi（内网地址即可，无需公网暴露），扩展便会通过标准协议接管该会话；具体配置项以扩展文档为准。建议先像本文一样，用一个 `print` + 一个变量 + 一张图做冒烟测试，确认 kernel 类型与连通性，再放手让 agent 干活。

## 6. 结语

好的 agent 工具，不该把执行环境锁死在本地沙箱，也不该把人和 AI 隔在两个 kernel 里。pi-jupyter 用"连一个真实、持久、可见的远程 Jupyter"这一个朴素的设计，同时打通了**本机能用超算的算力**和**人机共用一个会话**两件事——而这正是数据 / 科研场景里最缺的两块拼图。两轮跨内核实测下来，它稳定、规范、细节到位，是我会放心推荐给同样在 Jupyter 里讨生活的同行的一款插件。

去试试吧，让 agent 在你的超算 notebook 里，和你并肩写代码。

`pi install git:github.com/Limour-dev/pi-jupyter`
