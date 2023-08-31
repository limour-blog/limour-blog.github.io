---
title: 【迁移】Whisper搭配VoiceMeeter记录网课内容
urlname: -Whisper-da-pei-VoiceMeeter-ji-lu-wang-ke-nei-rong
date: 2023-03-16 21:02:17
tags: ['Whisper', 'VoiceMeeter']
---
由于网络环境、语音清晰度等问题，有时候我们可能会错过老师讲的重点内容。为了解决这个问题，我们可以使用OpenAI开源的自动语音识别系统Whisper，并结合虚拟声卡程序VoiceMeeter，来记录网课内容。这样一来，我们不仅可以随时回看老师的讲解，还可以对于不太清晰的语音进行识别，提高学习效率。

除了方便记录老师讲解的内容，使用Whisper和VoiceMeeter还可以快速构建自己的听课笔记。具体操作方法是将自动识别出来的文本内容复制到笔记软件中，然后加上自己的理解和注释，形成完整的笔记。这样一来，不仅可以帮助自己更好地理解知识点，还可以方便日后的复习和回顾。

同时，Whisper还支持多种语言的转录和翻译功能，这样即使是外语课程，也可以将讲解内容转录成本地语言，方便理解和记录。而且，Whisper还可以提高对于口音、背景噪音和技术术语的识别能力，让我们更加轻松地记录和理解老师的讲解。

总之，使用Whisper和VoiceMeeter可以方便快速地构建自己的听课笔记，提高学习效率和效果，是网课学习中不可或缺的好帮手。（以上介绍由chatGPT生成）

+ [VoiceMeeter](https://voicemeeter.com/)
+ Whisper 模型：[ggml-medium.bin](https://huggingface.co/datasets/ggerganov/whisper.cpp/blob/main/ggml-medium.bin)
+ Whisper 前端：[WhisperDesktop.zip](https://github.com/Const-me/Whisper/releases)

运行Whisper前端后，先选好Whisper模型的路径，然后下一步，在Capture Audio中选择VoiceMeeter的音频输出。