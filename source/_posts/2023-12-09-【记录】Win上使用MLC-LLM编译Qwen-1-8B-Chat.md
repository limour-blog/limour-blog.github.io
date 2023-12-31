---
title: 【记录】Win上使用MLC-LLM编译Qwen-1.8B-Chat
urlname: Compile-Qwen-1.8B-Chat-using-MLC-LLM-on-Win
index_img: https://api.limour.top/randomImg?d=2023-12-09 04:24:07
date: 2023-12-09 12:24:07
tags: llama
---
[MLC-LLM](https://github.com/mlc-ai/mlc-llm) 是一种大模型高性能通用部署解决方案，可以通过预编译加速使用本机API原生部署任何大型语言模型。该项目的使命是利用ML编译技术，使每个人都能在其设备上本地开发、优化和部署AI模型。
[Qwen-1.8B](https://huggingface.co/Qwen/Qwen-1_8B) 是阿里云研发的通义千问大模型系列的18亿参数规模的模型。在Qwen-1.8B的基础上，使用对齐机制打造了基于大语言模型的AI助手 [Qwen-1.8B-Chat](https://huggingface.co/Qwen/Qwen-1_8B-Chat)。
## 配置环境
+ [安装conda](/-ji-lu--an-zhuang-conda-bing-geng-huan-qing-hua-yuan)
+ [Tun模式](/Use-Tunnel-to-speed-up-the-connection-of-VPS)(管理员权限)
+ [详细流程](https://llm.mlc.ai/docs/install/tvm.html#install-tvm-unity)
```powershell
conda create -n mlc_llm python numpy pytorch transformers scipy timm git -c pytorch -c conda-forge
conda activate mlc_llm
python -m pip install --pre -U -f https://mlc.ai/wheels mlc-ai-nightly
python -c "import tvm; print('\n'.join(f'{k}: {v}' for k, v in tvm.support.libinfo().items()))"
python -c "import tvm; print(tvm.vulkan().exist)"
cd D:\mlc-llm
git clone --depth=1 -b main --single-branch https://github.com/mlc-ai/mlc-llm.git
cd .\mlc-llm\
git submodule sync
git submodule update --init --recursive --depth=1
pip install .
python -m mlc_llm.build --help
```
## 准备模型
```powershell
python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='Qwen/Qwen-1_8B-Chat', local_dir='D:\mlc-llm\qwen', ignore_patterns=['*.h5', '*.ot', '*.msgpack', '*.safetensors'])"
cd D:\mlc-llm\qwen
D:\aria2\aria2c.exe --all-proxy='http://127.0.0.1:7890' -o 'model-00001-of-00002.safetensors' "https://huggingface.co/Qwen/Qwen-1_8B-Chat/resolve/main/model-00001-of-00002.safetensors?download=true"
D:\aria2\aria2c.exe --all-proxy='http://127.0.0.1:7890' -o 'model-00002-of-00002.safetensors' "https://huggingface.co/Qwen/Qwen-1_8B-Chat/resolve/main/model-00002-of-00002.safetensors?download=true"
```
## 编译模型
```powershell
cd D:\mlc-llm\dist
python -m mlc_llm.build --model "D:\mlc-llm\qwen" --target vulkan --quantization q0f16 --use-safetensors
```
+ 等待模型支持：[Model type qwen not supported](https://github.com/mlc-ai/mlc-llm/issues/1373)