---
title: 【迁移】基于PaddleOCR的PDF转WORD
urlname: -ji-yu-PaddleOCR-de-PDF-zhuan-WORD
date: 2023-04-11 20:14:18
tags: ['PaddleOCR', 'PDF', 'WORD']
---
[PP-Structure](https://github.com/PaddlePaddle/PaddleOCR)是PaddleOCR团队自研的智能文档分析系统，旨在帮助开发者更好的完成版面分析、表格识别等文档理解相关任务。
PP-Structurev2的主要特性如下：
+ 支持对图片/pdf形式的文档进行版面分析，可以划分文字、标题、表格、图片、公式等区域；
+ 支持通用的中英文表格检测任务；
+ 支持表格区域进行结构化识别，最终结果输出Excel文件；
+ 支持基于多模态的关键信息抽取(Key Information Extraction，KIE)任务-语义实体识别(Semantic Entity Recognition，SER)和关系抽取(Relation Extraction，RE)；
+ 支持版面复原，即恢复为与原始图像布局一致的word或者pdf格式的文件；
+ 支持自定义训练及python whl包调用等多种推理部署方式，简单易用；
+ 与半自动数据标注工具PPOCRLabel打通，支持版面分析、表格识别、SER三种任务的标注。
## 安装PaddleOCR
```bash
conda create -n PP -c conda-forge python=3.8
conda activate PP
conda info --env
（二选一 GPU）conda install paddlepaddle-gpu==2.4.2 cudatoolkit=11.6 -c https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/Paddle/ -c conda-forge
（二选一 CPU）python -m pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple
使用 python 进入 python 解释器，输入import paddle ，再输入paddle.utils.run_check()
python -m pip install "paddleocr>=2.6" -i https://mirror.baidu.com/pypi/simple
Invoke-WebRequest -Uri "https://ghproxy.com/https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/release/2.6/ppstructure/recovery/requirements.txt" -OutFile "requirements.txt"
python -m pip install -r requirements.txt -i https://mirror.baidu.com/pypi/simple
```
+ `python -m pip install "PyMuPDF==1.18.7" -i https://mirror.baidu.com/pypi/simple` （解决[Issue#877](https://github.com/pymupdf/PyMuPDF/issues/877)）
## PDF转WORD
+ 准备一份没有嵌字，纯扫描件的UnrealText.pdf
+ paddleocr --image_dir=UnrealText.pdf --type=structure --recovery=true
+ 效果比直接用Acrobat好一点
+ 如果是简短的一段文字，还是直接用[Umi-OCR](https://github.com/hiroi-sora/Umi-OCR/releases)识别图片方便一点（基于PaddleOCR）
+ 等Microsoft 365 Copilot正式出来后，对paddleocr重建的docx进行智能纠错和格式美化应该效果会好一点。