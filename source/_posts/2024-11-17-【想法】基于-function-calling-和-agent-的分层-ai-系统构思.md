---
title: 【想法】基于函数调用和 Agent 的分层 AI 系统构思
urlname: concept-of-hierarchical-ai-system-based-on-function-calling-and-agent
index_img: https://api.limour.top/randomImg?d=2024-11-17 04:44:53
date: 2024-11-17 12:44:53
tags: [FC, agent]
---
最近冲浪看到一篇[有限模型尺寸无限上下文可以实现图灵等价](https://arxiv.org/abs/2402.12875)的文章，结合 Openai 的 [swarm](https://github.com/openai/swarm) 使用  Function Calling 能高效优雅地实现多 Agents，以及 Function Calling 实现 [RAG](develop-rag-plugin-for-next-web) 也非常简单，因此产生了这一想法。

![](https://img.limour.top/2024/11/17/6739876cbe7a3.webp)
## 需要的组件
1. 一个超大尺寸有限上下文的模型，负责深入思考，记为 `M0(question, context)`
2. 一个中等尺寸较长上下文的模型，负责执行，记为 `M1(task, context)`
3. 一个较小尺寸超长上下文的模型，负责规划，记为 `M2(goal, context)`
4. 一个向量检索系统，具有召回、更新和睡眠三个方法，召回记为 `R(query)`，更新记为 `U(memory)`，睡眠记为 `S()`
5. 一个 Agent 框架，将以上四个系统串起来
## 向量检索系统
### 更新方法
`U(memory: str) -> bool` 方法的描述为 `记住一段记忆`。

`U(memory: str) -> bool` 具有一个 `memory: str` 参数，其描述为 `一段需要记住的记忆，300词左右`，会返回一个 `ok`，表示记忆写入成功。

系统内部写入记忆时，会带上一个具有单向时间流动的时间标记 `time: int`；初始为写入的时间，同时有一个表示记忆强度的 `level: int`，初始为 `0`。
### 召回方法
`R(query：str) -> List[str]` 方法的描述为 `回忆相关记忆`。

`R(query：str) -> List[str]` 具有一个 `query：str` 参数，其描述为 `需要在记忆中检索的句子`，返回一个相关记忆的列表，列表中的记忆均由 `U(memory)` 写入而来。

系统内部召回记忆时会做三件事情，第一是召回记忆，并对召回的记忆进行重排，取重排后的 `topn: int` 项，以 `List[str]` 的形式返回。

第二是对返回的 `List[str]` 中的记忆的 `time: int` 更新，值为成功召回的时间，同时判断时间差是否大于某个超参数，大于则 `level: int` 自增1，否则不变。`level: int` 为 `0` 时，必自增1。超参数相对于 `level: int` 以指数的形式增长，达到某上限后不再变化，同时记忆转为长期记忆，`level: int` 不再变化。

第三是对召回成功但未能在重排后进入 `List[str]` 的记忆，去掉其中属于长期记忆的部分，对余下的部分进行操作。判断 `time: int` 与当前时间差是否大于某个超参数，大于则 `level: int` 自减1。若 `level: int` 为 `-1`，从记忆中删去此记忆。
### 睡眠方法
`S() -> str` 方法的描述为 `整理记忆、保持高效`。

`S() -> str` 没有参数，返回一个梦境。内部会随机选取 `n: int` 段记忆，判断每段记忆的 `time: int` 与当前时间差是否大于某个超参数，大于则 `level: int` 自减1。若 `level: int` 为 `-1`，从记忆中删去此记忆。被删除的记忆记为 `List[str]`，调用 `M1(task, context)`，其 `task` 为 `根据碎片的信息，生成一段梦境`，其 `context` 为被删除的记忆 `List[str]` 通过分割符连接而成的一段文字。

## M0模型
`M0(question: str, context: str) -> str` 方法的描述为 `针对具体问题进行深入思考`，`system prompt` 为 CoT 的模板。

其 `Function Calling` 仅连接了 `R(query)` 和 `U(memory)`。

其只返回最后的结果，以 `<|thinking_start|>...<|thinking_end|>` 包裹。
## M1模型
`M1(task: str, context: str) -> str` 方法的描述为 `执行具体明确的任务`，`system prompt` 为 `分解任务为具体问题，逐个解决问题`。

其 `Function Calling` 连接了 `R(query)`、 `U(memory)`、`M0(question, context)`，并动态连接其他必要的解决任务的工具。

其只返回最后的结果。
## M2模型
`M2(goal: str, context: str) -> str` 方法的描述为 `循环规划任务，在长期存活的前提下实现目标`，`system prompt` 为 `人生有梦、各自精彩，活下去、找到你的价值、实现你的目标`。

其 `Function Calling` 连接了 `R(query)`、`U(memory)`、`S()` 和 `M1(task, context)`。

其特别附加一个 `I(tip: str, timeout: int) -> str`， 描述为 `请求用户输入`，`tip: str`的描述为 `输入提示信息`，`timeout: int`的描述为 `愿意等待用户的时间`，超时后将返回 `用户暂未回复`，否则返回用户输入的信息。

遇到 `<|im_end|>` 时循环会自动添加 `<|im_start|>`，继续进行循环，直到系统崩溃。